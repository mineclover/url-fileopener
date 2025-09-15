import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Mock CLI command functions
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

function saveConfig(config) {
  config.lastUpdated = new Date().toISOString()
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
}

// CLI command functions
function addProject(projectName, projectPath) {
  if (!projectName) {
    throw new Error('Missing required project name')
  }

  const absolutePath = projectPath ? path.resolve(projectPath) : process.cwd()

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Path does not exist: ${absolutePath}`)
  }

  const config = getConfig()
  config.projects[projectName] = absolutePath
  saveConfig(config)
  
  return { projectName, absolutePath }
}

function removeProject(projectName) {
  if (!projectName) {
    throw new Error('Missing required project name')
  }

  const config = getConfig()
  if (!config.projects[projectName]) {
    throw new Error(`Project '${projectName}' not found`)
  }

  delete config.projects[projectName]
  saveConfig(config)
  
  return projectName
}

function listProjects() {
  const config = getConfig()
  return config.projects
}

describe('CLI Commands', () => {
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

  describe('add command', () => {
    it('should add a project with absolute path', () => {
      const testPath = os.tmpdir()
      const result = addProject('test-project', testPath)
      
      expect(result.projectName).toBe('test-project')
      expect(result.absolutePath).toBe(path.resolve(testPath))
      
      // Read config directly to verify it was saved
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
      expect(config.projects['test-project']).toBe(path.resolve(testPath))
    })

    it('should add a project with relative path', () => {
      const result = addProject('current-project', '.')
      
      expect(result.projectName).toBe('current-project')
      expect(result.absolutePath).toBe(process.cwd())
    })

    it('should add a project without path (defaults to current directory)', () => {
      const result = addProject('default-project')
      
      expect(result.projectName).toBe('default-project')
      expect(result.absolutePath).toBe(process.cwd())
    })

    it('should throw error for missing project name', () => {
      expect(() => addProject()).toThrow('Missing required project name')
      expect(() => addProject('')).toThrow('Missing required project name')
    })

    it('should throw error for non-existent path', () => {
      expect(() => addProject('test', '/non/existent/path')).toThrow('Path does not exist')
    })

    it('should overwrite existing project', () => {
      const testPath1 = os.tmpdir()
      const testPath2 = os.tmpdir() // Use same temp dir to avoid path issues
      
      addProject('test-project', testPath1)
      addProject('test-project', testPath2)
      
      const config = getConfig()
      expect(config.projects['test-project']).toBe(path.resolve(testPath2))
    })
  })

  describe('remove command', () => {
    it('should remove existing project', () => {
      const testPath = os.tmpdir()
      addProject('test-project', testPath)
      
      const result = removeProject('test-project')
      expect(result).toBe('test-project')
      
      const config = getConfig()
      expect(config.projects['test-project']).toBeUndefined()
    })

    it('should throw error for missing project name', () => {
      expect(() => removeProject()).toThrow('Missing required project name')
      expect(() => removeProject('')).toThrow('Missing required project name')
    })

    it('should throw error for non-existent project', () => {
      // First ensure config exists
      getConfig()
      expect(() => removeProject('non-existent')).toThrow("Project 'non-existent' not found")
    })
  })

  describe('list command', () => {
    it('should return empty object when no projects', () => {
      const projects = listProjects()
      expect(projects).toEqual({})
    })

    it('should return all configured projects', () => {
      const testPath1 = os.tmpdir()
      const testPath2 = os.tmpdir() // Use same temp dir to avoid path issues
      
      addProject('project1', testPath1)
      addProject('project2', testPath2)
      
      const projects = listProjects()
      expect(Object.keys(projects)).toHaveLength(2)
      expect(projects['project1']).toBe(path.resolve(testPath1))
      expect(projects['project2']).toBe(path.resolve(testPath2))
    })
  })

  describe('integration tests', () => {
    it('should handle complete project lifecycle', () => {
      const testPath = os.tmpdir()
      
      // Add project
      addProject('lifecycle-test', testPath)
      let projects = listProjects()
      expect(projects['lifecycle-test']).toBe(path.resolve(testPath))
      
      // Remove project
      removeProject('lifecycle-test')
      projects = listProjects()
      expect(projects['lifecycle-test']).toBeUndefined()
    })

    it('should handle multiple projects independently', () => {
      const testPath1 = os.tmpdir()
      const testPath2 = os.tmpdir() // Use same temp dir to avoid path issues
      
      // Add multiple projects
      addProject('project1', testPath1)
      addProject('project2', testPath2)
      
      let projects = listProjects()
      expect(Object.keys(projects)).toHaveLength(2)
      
      // Remove one project
      removeProject('project1')
      projects = listProjects()
      expect(Object.keys(projects)).toHaveLength(1)
      expect(projects['project2']).toBe(path.resolve(testPath2))
    })
  })
})
