#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const CONFIG_DIR = path.join(os.homedir(), '.fopen-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const LOG_FILE = path.join(CONFIG_DIR, 'handler.log');

// Logging function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
}

// Get config
function getConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    log('Config file does not exist');
    return { projects: {} };
  }

  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    return config;
  } catch (error) {
    log(`Failed to parse config file: ${error.message}`);
    return { projects: {} };
  }
}

// File opening functionality
function openFile(filePath) {
  const platform = process.platform;
  let command, args;

  switch (platform) {
    case 'darwin': // macOS
      command = 'open';
      args = [filePath];
      break;
    case 'win32': // Windows
      command = 'start';
      args = ['', filePath];
      break;
    case 'linux': // Linux
      command = 'xdg-open';
      args = [filePath];
      break;
    default:
      log(`Unsupported platform: ${platform}`);
      return;
  }

  const child = spawn(command, args, {
    detached: true,
    stdio: 'ignore'
  });

  child.on('error', (error) => {
    log(`Failed to open file: ${error.message}`);
  });

  child.on('spawn', () => {
    log(`File opened successfully: ${filePath}`);
    child.unref();
  });
}

// Parse URL and open file
function handleUrl(url) {
  log(`Processing URL: ${url}`);

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== 'fileopener:') {
      log(`Invalid protocol: ${parsedUrl.protocol}. Expected 'fileopener:'`);
      return;
    }

    const project = parsedUrl.hostname;
    if (!project) {
      log('Project name is required in URL');
      return;
    }

    let filePath;
    // Check for legacy query parameter format
    const queryPath = parsedUrl.searchParams.get('path');
    if (queryPath) {
      // Legacy format: fileopener://project?path=file/path
      filePath = decodeURIComponent(queryPath);
    } else {
      // Modern format: fileopener://project/file/path
      filePath = parsedUrl.pathname.slice(1); // Remove leading slash
      if (!filePath) {
        log('File path is required in URL');
        return;
      }
      filePath = decodeURIComponent(filePath);
    }

    log(`Project: ${project}, File: ${filePath}`);

    // Get project path from config
    const config = getConfig();
    const projectPath = config.projects[project];

    if (!projectPath) {
      log(`Project '${project}' not found in configuration`);
      return;
    }

    // Resolve full file path
    const fullPath = path.resolve(path.join(projectPath, filePath));

    // Security check: ensure the resolved path is within the project directory
    const normalizedProjectPath = path.resolve(projectPath);
    if (!fullPath.startsWith(normalizedProjectPath)) {
      log('Path traversal detected - access denied for security reasons');
      return;
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      log(`File not found: ${fullPath}`);
      return;
    }

    // Open the file
    openFile(fullPath);

  } catch (error) {
    log(`Failed to parse URL: ${error.message}`);
  }
}

// Main handler logic
const url = process.argv[2];
if (!url) {
  log('No URL provided');
  process.exit(1);
}

// Ensure log directory exists
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

handleUrl(url);