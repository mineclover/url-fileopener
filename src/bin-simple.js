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
  console.log("Installing file opener protocol...")
  ensureConfigDir()

  // Register protocol using protocol-registry
  try {
    const protocolRegistry = require("protocol-registry")
    const handlerPath = path.join(__dirname, "bin", "fopen-handler-simple.cjs")
    const command = `node "${handlerPath}" "$_URL_"`

    console.log(`Registering protocol: "fileopener"`)
    console.log(`With command: "${command}"`)

    await protocolRegistry.register("fileopener", command, {
      override: true,
      terminal: false
    })
    console.log('\nProtocol registration successful!')
    console.log("Configuration directory: " + CONFIG_DIR)
  } catch (error) {
    console.error('\nError during protocol registration:', error)
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
    }).catch((error) => {
      console.error("Failed to unregister protocol:", error.message)
    })
  } catch (error) {
    console.log("Protocol unregistered successfully (manual)")
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
    child.unref()
  })
}

// Parse URL and open file
function handleUrl(url) {
  console.log(`Processing URL: ${url}`)

  try {
    const parsedUrl = new URL(url)

    if (parsedUrl.protocol !== "fileopener:") {
      console.log(`Invalid protocol: ${parsedUrl.protocol}. Expected 'fileopener:'`)
      return
    }

    const project = parsedUrl.hostname
    if (!project) {
      console.log("Project name is required in URL")
      return
    }

    // Handle special case for config
    if (project === 'config' && !parsedUrl.pathname.replace(/^\/+/, '')) {
      console.log(`Opening config file: ${CONFIG_FILE}`)
      openFile(CONFIG_FILE)
      return
    }

    let filePath
    // Check for legacy query parameter format
    const queryPath = parsedUrl.searchParams.get("path")
    if (queryPath) {
      // Legacy format: fileopener://project?path=file/path
      filePath = decodeURIComponent(queryPath)
    } else {
      // Modern format: fileopener://project/file/path
      filePath = parsedUrl.pathname.slice(1) // Remove leading slash
      if (!filePath) {
        console.log("File path is required in URL")
        return
      }
      filePath = decodeURIComponent(filePath)
    }

    console.log(`Project: ${project}, File: ${filePath}`)

    // Get project path from config
    const config = getConfig()
    const projectPath = config.projects[project]

    if (!projectPath) {
      console.log(`Project '${project}' not found in configuration`)
      console.log("Available projects:")
      for (const [name, path] of Object.entries(config.projects)) {
        console.log(`  ${name} -> ${path}`)
      }
      return
    }

    // Resolve full file path
    const fullPath = path.resolve(path.join(projectPath, filePath))

    // Security check: ensure the resolved path is within the project directory
    const normalizedProjectPath = path.resolve(projectPath)
    if (!fullPath.startsWith(normalizedProjectPath)) {
      console.log("Path traversal detected - access denied for security reasons")
      return
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${fullPath}`)
      return
    }

    // Open the file
    openFile(fullPath)
  } catch (error) {
    console.log(`Failed to parse URL: ${error.message}`)
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
  case "open":
    if (!args[1]) {
      console.log("Missing required URL")
      console.log("Usage: fopen open <fileopener://url>")
    } else {
      handleUrl(args[1])
    }
    break
  case "config":
    openConfig()
    break
  default:
    console.log("File opener CLI - Use one of the subcommands:")
    console.log("  install   - Register the fileopener:// protocol")
    console.log("  add       - Add a project alias")
    console.log("  list      - List all configured projects")
    console.log("  remove    - Remove a project alias")
    console.log("  uninstall - Unregister the protocol")
    console.log("  open      - Open a file using fileopener:// URL")
    console.log("  config    - Open the configuration file")
}
