import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Mock the URL handler functions
let CONFIG_DIR
let CONFIG_FILE

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true })
  }
}

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
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
}

function saveConfig(config) {
  config.lastUpdated = new Date().toISOString()
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
}

// URL parsing function
function parseUrl(url) {
  try {
    const parsedUrl = new URL(url)
    
    if (parsedUrl.protocol !== 'fileopener:') {
      throw new Error(`Invalid protocol: ${parsedUrl.protocol}. Expected 'fileopener:'`)
    }

    const project = parsedUrl.hostname
    if (!project) {
      throw new Error('Project name is required in URL')
    }

    let filePath
    // Check for legacy query parameter format
    const queryPath = parsedUrl.searchParams.get('path')
    if (queryPath) {
      // Legacy format: fileopener://project?path=file/path
      filePath = decodeURIComponent(queryPath)
    } else {
      // Modern format: fileopener://project/file/path
      filePath = parsedUrl.pathname.slice(1) // Remove leading slash
      if (!filePath) {
        throw new Error('File path is required in URL')
      }
      filePath = decodeURIComponent(filePath)
    }

    return { project, filePath }
  } catch (error) {
    throw new Error(`Failed to parse URL: ${error.message}`)
  }
}

// Security validation function
function validatePath(filePath, projectPath) {
  // Check for path traversal attempts
  if (filePath.includes('..') || filePath.includes('~')) {
    throw new Error('SECURITY VIOLATION: Path traversal attempt detected')
  }

  // Check for absolute paths (should be relative to project)
  if (path.isAbsolute(filePath)) {
    throw new Error('SECURITY VIOLATION: Absolute path not allowed')
  }

    // Check for Windows-style absolute paths (C:\, D:\, etc.)
    if (/^[A-Za-z]:[\\/]/.test(filePath)) {
    throw new Error('SECURITY VIOLATION: Windows absolute path not allowed')
  }

  // Normalize the path to prevent various bypass attempts
  const normalizedPath = path.normalize(filePath)
  
  // Check for any remaining traversal attempts after normalization
  if (normalizedPath.includes('..')) {
    throw new Error('SECURITY VIOLATION: Path traversal detected after normalization')
  }

  // Resolve full file path
  const fullPath = path.resolve(path.join(projectPath, normalizedPath))
  const normalizedProjectPath = path.resolve(projectPath)

  // Final security check: ensure the resolved path is within the project directory
  if (!fullPath.startsWith(normalizedProjectPath)) {
    throw new Error('SECURITY VIOLATION: Path outside project directory')
  }

  return fullPath
}

describe('URL Handler', () => {
  beforeEach(() => {
    // Create unique test directory for each test
    CONFIG_DIR = path.join(os.tmpdir(), `.fopen-cli-test-${Date.now()}-${Math.random()}`)
    CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')
  })

  afterEach(() => {
    if (fs.existsSync(CONFIG_DIR)) {
      try {
        fs.rmSync(CONFIG_DIR, { recursive: true, force: true })
      } catch (_error) {
        // Ignore cleanup errors
      }
    }
  })

  describe('URL Parsing', () => {
    it('should parse modern URL format correctly', () => {
      const url = 'fileopener://myproject/src/index.js'
      const result = parseUrl(url)
      
      expect(result.project).toBe('myproject')
      expect(result.filePath).toBe('src/index.js')
    })

    it('should parse legacy URL format correctly', () => {
      const url = 'fileopener://myproject?path=src/index.js'
      const result = parseUrl(url)
      
      expect(result.project).toBe('myproject')
      expect(result.filePath).toBe('src/index.js')
    })

    it('should handle URL encoded paths', () => {
      const url = 'fileopener://myproject/src%2Findex.js'
      const result = parseUrl(url)
      
      expect(result.project).toBe('myproject')
      expect(result.filePath).toBe('src/index.js')
    })

    it('should reject invalid protocol', () => {
      const url = 'http://myproject/src/index.js'
      
      expect(() => parseUrl(url)).toThrow('Invalid protocol: http:. Expected \'fileopener:\'')
    })

    it('should reject URL without project name', () => {
      const url = 'fileopener:///src/index.js'
      
      expect(() => parseUrl(url)).toThrow('Project name is required in URL')
    })

    it('should reject URL without file path', () => {
      const url = 'fileopener://myproject'
      
      expect(() => parseUrl(url)).toThrow('File path is required in URL')
    })
  })

  describe('Security Validation', () => {
    const projectPath = '/home/user/project'

    it('should allow valid relative paths', () => {
      const filePath = 'src/index.js'
      const result = validatePath(filePath, projectPath)
      
      expect(result).toBe('/home/user/project/src/index.js')
    })

    it('should reject path traversal attempts', () => {
      const filePath = '../../../etc/passwd'
      
      expect(() => validatePath(filePath, projectPath)).toThrow('SECURITY VIOLATION: Path traversal attempt detected')
    })

    it('should reject absolute paths', () => {
      const filePath = '/etc/passwd'
      
      expect(() => validatePath(filePath, projectPath)).toThrow('SECURITY VIOLATION: Absolute path not allowed')
    })

    it('should reject Windows absolute paths', () => {
      const filePath = 'C:\\Windows\\System32'
      
      expect(() => validatePath(filePath, projectPath)).toThrow('SECURITY VIOLATION: Windows absolute path not allowed')
    })

    it('should reject paths with tilde', () => {
      const filePath = '~/secret'
      
      expect(() => validatePath(filePath, projectPath)).toThrow('SECURITY VIOLATION: Path traversal attempt detected')
    })

    it('should handle complex traversal attempts', () => {
      const filePath = 'src/../..//etc/passwd'
      
      expect(() => validatePath(filePath, projectPath)).toThrow('SECURITY VIOLATION: Path traversal attempt detected')
    })

    it('should allow nested directories', () => {
      const filePath = 'src/components/Button.js'
      const result = validatePath(filePath, projectPath)
      
      expect(result).toBe('/home/user/project/src/components/Button.js')
    })
  })

  describe('Project Configuration', () => {
    it('should add and retrieve project configuration', () => {
      ensureConfigDir() // Ensure directory exists first
      const config = getConfig()
      config.projects['test-project'] = '/path/to/project'
      saveConfig(config)
      
      const loadedConfig = getConfig()
      expect(loadedConfig.projects['test-project']).toBe('/path/to/project')
    })

    it('should handle multiple projects', () => {
      ensureConfigDir() // Ensure directory exists first
      const config = getConfig()
      config.projects['project1'] = '/path/to/project1'
      config.projects['project2'] = '/path/to/project2'
      saveConfig(config)
      
      const loadedConfig = getConfig()
      expect(Object.keys(loadedConfig.projects)).toHaveLength(2)
      expect(loadedConfig.projects['project1']).toBe('/path/to/project1')
      expect(loadedConfig.projects['project2']).toBe('/path/to/project2')
    })
  })
})
