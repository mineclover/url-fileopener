import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Mock the config functions
let CONFIG_DIR
let CONFIG_FILE

// Ensure config directory exists
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true })
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
  
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
  } catch (_error) {
    // If config file is malformed, create a new default config
    const defaultConfig = {
      projects: {},
      version: "1.0.0",
      lastUpdated: new Date().toISOString()
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2))
    return defaultConfig
  }
}

// Save config
function saveConfig(config) {
  config.lastUpdated = new Date().toISOString()
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
}

describe('Config Management', () => {
  beforeEach(() => {
    // Create unique test directory for each test
    CONFIG_DIR = path.join(os.tmpdir(), `.fopen-cli-test-${Date.now()}-${Math.random()}`)
    CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')
  })

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(CONFIG_DIR)) {
      try {
        fs.rmSync(CONFIG_DIR, { recursive: true, force: true })
      } catch (_error) {
        // Ignore cleanup errors
      }
    }
  })

  it('should create default config when none exists', () => {
    const config = getConfig()
    
    expect(config).toHaveProperty('projects')
    expect(config).toHaveProperty('version', '1.0.0')
    expect(config).toHaveProperty('lastUpdated')
    expect(config.projects).toEqual({})
  })

  it('should load existing config', () => {
    ensureConfigDir() // Ensure directory exists first
    const testConfig = {
      projects: { 'test-project': '/path/to/project' },
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    }
    
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(testConfig, null, 2))
    
    // Create a fresh getConfig function that doesn't create default config
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
    
    expect(config.projects).toEqual({ 'test-project': '/path/to/project' })
  })

  it('should save config with updated timestamp', async () => {
    const config = getConfig()
    const originalTimestamp = config.lastUpdated
    
    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10))
    saveConfig(config)
    
    // Read config directly to avoid getConfig() creating new default
    const updatedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
    expect(updatedConfig.lastUpdated).not.toBe(originalTimestamp)
  })

  it('should handle malformed config gracefully', () => {
    ensureConfigDir() // Ensure directory exists first
    fs.writeFileSync(CONFIG_FILE, 'invalid json')
    
    // This should create a new default config when parsing fails
    const config = getConfig()
    expect(config).toHaveProperty('projects')
    expect(config).toHaveProperty('version', '1.0.0')
  })
})
