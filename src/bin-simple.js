#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const os = require("os")
const { spawn } = require("child_process")

const CONFIG_DIR = path.join(os.homedir(), ".fopen-cli")
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json")

// Ensure config directory exists
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true })
    console.log("Configuration directory created")
  }
}

// Get config
function getConfig() {
  ensureConfigDir()
  if (!fs.existsSync(CONFIG_FILE)) {
    const defaultConfig = {
      projects: {},
      version: "1.0.0",
      lastUpdated: new Date().toISOString()
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2))
    return defaultConfig
  }
  return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"))
}

// Save config
function saveConfig(config) {
  config.lastUpdated = new Date().toISOString()
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
}

// Commands
async function install() {
  logInfo("Installing file opener protocol...")
  ensureConfigDir()

  // Register protocol using protocol-registry
  try {
    const protocolRegistry = require("protocol-registry")
    const handlerPath = path.join(__dirname, "bin", "fopen-handler-simple.cjs")
    const command = `node "${handlerPath}" "$_URL_"`

    logInfo("Registering protocol", {
      "Protocol": "fileopener",
      "Command": command,
      "Handler path": handlerPath
    })

    await protocolRegistry.register("fileopener", command, {
      override: true,
      terminal: false
    })
    logInfo("Protocol registration successful", {
      "Configuration directory": CONFIG_DIR
    })
  } catch (error) {
    logError("Error during protocol registration", {
      "Error": error.message,
      "Stack": error.stack
    })
  }
}

function add(projectName, projectPath) {
  if (!projectName) {
    console.log("Missing required project name")
    console.log("Usage: fopen add <project> [path]")
    return
  }

  const absolutePath = projectPath ? path.resolve(projectPath) : process.cwd()

  if (!fs.existsSync(absolutePath)) {
    console.log(`Path does not exist: ${absolutePath}`)
    return
  }

  const config = getConfig()
  config.projects[projectName] = absolutePath
  saveConfig(config)
  console.log(`Project '${projectName}' added successfully`)
  console.log(`  -> ${absolutePath}`)
}

function list() {
  const config = getConfig()
  const projects = config.projects
  const count = Object.keys(projects).length

  if (count === 0) {
    console.log("No projects configured")
  } else {
    console.log("Configured projects:")
    for (const [name, projectPath] of Object.entries(projects)) {
      console.log(`  ${name} -> ${projectPath}`)
    }
  }
}

function remove(projectName) {
  if (!projectName) {
    console.log("Missing required project name")
    console.log("Usage: fopen remove <project>")
    return
  }

  const config = getConfig()
  if (config.projects[projectName]) {
    delete config.projects[projectName]
    saveConfig(config)
    console.log(`Project '${projectName}' removed successfully`)
  } else {
    console.log(`Project '${projectName}' not found`)
  }
}

function uninstall() {
  console.log("Uninstalling file opener protocol...")
  try {
    const protocolRegistry = require("protocol-registry")
    protocolRegistry.remove("fileopener").then(() => {
      console.log("Protocol unregistered successfully")
    }).catch((_error) => {
      console.error("Failed to unregister protocol:", _error.message)
    })
  } catch (_error) {
    console.log("Protocol unregistered successfully (manual)")
  }
}

function cleanLogs() {
  const LOG_FILE = path.join(CONFIG_DIR, "handler.log")
  const BACKUP_LOG_FILE = LOG_FILE + ".old"
  
  let cleaned = false
  
  if (fs.existsSync(LOG_FILE)) {
    fs.unlinkSync(LOG_FILE)
    console.log("Current log file removed")
    cleaned = true
  }
  
  if (fs.existsSync(BACKUP_LOG_FILE)) {
    fs.unlinkSync(BACKUP_LOG_FILE)
    console.log("Backup log file removed")
    cleaned = true
  }
  
  if (!cleaned) {
    console.log("No log files found to clean")
  }
}

// File opening functionality
function openFile(filePath) {
  const platform = process.platform
  let command, args

  switch (platform) {
    case "darwin": // macOS
      command = "open"
      args = [filePath]
      break
    case "win32": // Windows
      command = "start"
      args = ["", filePath]
      break
    case "linux": // Linux
      command = "xdg-open"
      args = [filePath]
      break
    default:
      console.log(`Unsupported platform: ${platform}`)
      return
  }

  const child = spawn(command, args, {
    detached: true,
    stdio: "ignore"
  })

  child.on("error", (error) => {
    console.log(`Failed to open file: ${error.message}`)
  })

  child.on("spawn", () => {
    console.log(`File opened successfully: ${filePath}`)
    // Unref to allow parent process to exit independently
    child.unref()
  })

  // Ensure child process doesn't keep parent alive
  child.on("exit", () => {
    // Child process has exited, no action needed
  })

  // Set a timeout to force exit if child doesn't exit quickly
  setTimeout(() => {
    if (!child.killed) {
      child.kill('SIGTERM')
    }
  }, 5000) // 5 second timeout
}

// Logging functions
function logInfo(message, details = {}) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] INFO: ${message}`)
  
  for (const [key, value] of Object.entries(details)) {
    console.log(`[${timestamp}] ${key}: "${value}"`)
  }
}


function logError(message, details = {}) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ERROR: ${message}`)
  
  for (const [key, value] of Object.entries(details)) {
    console.log(`[${timestamp}] ${key}: "${value}"`)
  }
}





// Open config file
function openConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.log("Config file does not exist. Run \"fopen install\" first.")
    return
  }

  console.log(`Opening config file: ${CONFIG_FILE}`)
  openFile(CONFIG_FILE)
  
  // Exit the process after opening the config file
  setTimeout(() => {
    process.exit(0)
  }, 100)
}

// Main CLI logic
const args = process.argv.slice(2)
const command = args[0]

switch (command) {
  case "install":
    install().catch(console.error)
    break
  case "add":
    add(args[1], args[2])
    break
  case "list":
    list()
    break
  case "remove":
    remove(args[1])
    break
  case "uninstall":
    uninstall()
    break
  case "config":
    openConfig()
    break
  case "clean-logs":
    cleanLogs()
    break
  default:
    console.log("File opener CLI - Use one of the subcommands:")
    console.log("  install     - Register the fileopener:// protocol")
    console.log("  add         - Add a project alias")
    console.log("  list        - List all configured projects")
    console.log("  remove      - Remove a project alias")
    console.log("  uninstall   - Unregister the protocol")
    console.log("  config      - Open the configuration file")
    console.log("  clean-logs  - Clean log files")
}
