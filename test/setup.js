// Test setup file
import { vi } from 'vitest'

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
}

// Mock process.exit to prevent tests from actually exiting
const originalExit = process.exit
process.exit = vi.fn()

// Restore original exit after each test
afterEach(() => {
  vi.clearAllMocks()
})

// Restore original exit on cleanup
afterAll(() => {
  process.exit = originalExit
})
