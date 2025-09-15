# Testing Guide

## Overview

This project follows Test-Driven Development (TDD) principles with comprehensive test coverage across multiple levels.

## Test Structure

```
tests/
├── contract/            # Contract tests (API behavior)
├── integration/         # Integration tests (end-to-end)
└── unit/               # Unit tests (individual components)
```

## Test Categories

### Contract Tests (T006-T013)

Contract tests verify the CLI command interface and ensure commands behave according to their specifications.

**Location**: `tests/contract/`

**Files:**
- `install-command.test.ts` - Protocol installation testing
- `add-command.test.ts` - Project addition testing
- `list-command.test.ts` - Project listing testing
- `remove-command.test.ts` - Project removal testing
- `uninstall-command.test.ts` - Protocol uninstallation testing
- `url-parsing.test.ts` - Modern URL format parsing
- `url-parsing-legacy.test.ts` - Legacy URL format parsing
- `security-validation.test.ts` - Path traversal prevention

**Purpose:**
- Validate CLI command contracts
- Ensure expected input/output behavior
- Test error cases and edge conditions

### Integration Tests (T014-T017)

Integration tests verify complete workflows and system interactions.

**Location**: `tests/integration/`

**Files:**
- `setup-flow.test.ts` - Complete setup workflow (install → add → test)
- `file-opening.test.ts` - File opening workflow validation
- `config-management.test.ts` - Configuration file management
- `protocol-registration.test.ts` - Real OS protocol registration

**Purpose:**
- Test complete user workflows
- Validate system integration
- Test real protocol registration
- Verify cross-platform functionality

### Unit Tests (Future)

Unit tests for individual service components.

**Location**: `tests/unit/`

**Planned:**
- URL parser logic testing
- Path validation testing
- Configuration operations testing

## Running Tests

### All Tests
```bash
pnpm test
```

### With Coverage
```bash
pnpm coverage
```

### Specific Test Suites
```bash
# Contract tests only
pnpm test tests/contract/

# Integration tests only
pnpm test tests/integration/

# Specific test file
pnpm test tests/contract/url-parsing.test.ts
```

### Watch Mode
```bash
pnpm test --watch
```

## Test Implementation Guidelines

### TDD Approach

1. **RED**: Write failing test first
2. **GREEN**: Write minimal code to pass
3. **REFACTOR**: Improve code while keeping tests green

### Test Structure

```typescript
import { describe, it, expect } from "vitest"

describe("Feature Name", () => {
  it("should behave as expected", () => {
    // Arrange
    const input = "test input"

    // Act
    const result = functionUnderTest(input)

    // Assert
    expect(result).toBe("expected output")
  })
})
```

### Contract Test Pattern

Contract tests verify external behavior:

```typescript
describe("fopen command contract", () => {
  it("should return success message for valid input", () => {
    const result = execSync("fopen command args", { encoding: "utf8" })
    expect(result).toContain("Success message")
  })

  it("should return error for invalid input", () => {
    expect(() => {
      execSync("fopen command invalid", { encoding: "utf8" })
    }).toThrow()
  })
})
```

### Integration Test Pattern

Integration tests verify workflows:

```typescript
describe("Complete workflow", () => {
  beforeEach(() => {
    // Setup test environment
  })

  afterEach(() => {
    // Cleanup test environment
  })

  it("should complete full workflow successfully", () => {
    // Step 1: Setup
    execSync("fopen install")

    // Step 2: Add project
    execSync("fopen add test /path/to/test")

    // Step 3: Verify
    const result = execSync("fopen list")
    expect(result).toContain("test -> /path/to/test")
  })
})
```

## Test Environment Setup

### Prerequisites

- Node.js 18+
- pnpm package manager
- Vitest testing framework

### Environment Variables

Tests may use these environment variables:

```bash
# Test mode (disables actual protocol registration)
TEST_MODE=true

# Test data directory
TEST_DATA_DIR=/tmp/fopen-test

# Mock external dependencies
MOCK_PROTOCOL_REGISTRY=true
```

### Mocking Strategy

**Real Dependencies Preferred**: Tests use real file system and protocol registration when possible for authentic validation.

**Mocked Components**:
- External protocol registration (in CI environments)
- System commands (when testing cross-platform behavior)
- File system operations (for error condition testing)

## Test Data Management

### Temporary Directories

Tests create and clean up temporary directories:

```typescript
import { tmpdir } from "os"
import { join } from "path"

let testDir: string

beforeEach(() => {
  testDir = join(tmpdir(), `fopen-test-${Date.now()}`)
  mkdirSync(testDir, { recursive: true })
})

afterEach(() => {
  rmSync(testDir, { recursive: true, force: true })
})
```

### Test Configuration

Tests use isolated configuration:

```typescript
const TEST_CONFIG_DIR = join(tmpdir(), "test-protocol-registry")
process.env.CONFIG_DIR = TEST_CONFIG_DIR
```

## Coverage Requirements

### Minimum Coverage Targets

- **Overall**: 90%
- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 90%
- **Lines**: 90%

### Coverage Exclusions

- Generated files (`dist/`)
- Test files (`tests/`)
- Configuration files
- Type definition files

## Continuous Integration

### Test Pipeline

```yaml
test:
  runs-on: [ubuntu-latest, macos-latest, windows-latest]
  steps:
    - install dependencies
    - run linting
    - run type checking
    - run tests with coverage
    - upload coverage reports
```

### Cross-Platform Testing

Tests run on multiple platforms to ensure compatibility:

- **Ubuntu**: Linux compatibility
- **macOS**: macOS compatibility
- **Windows**: Windows compatibility

## Performance Testing

### Response Time Requirements

Commands should complete within performance thresholds:

- CLI commands: < 100ms
- File opening: < 200ms
- Protocol registration: < 1000ms

### Performance Test Example

```typescript
it("should complete command within time limit", async () => {
  const start = Date.now()

  execSync("fopen list")

  const duration = Date.now() - start
  expect(duration).toBeLessThan(100)
})
```

## Security Testing

### Path Traversal Tests

Verify security protections:

```typescript
it("should block path traversal attempts", () => {
  expect(() => {
    execSync("fopen open 'fileopener://project/../../../etc/passwd'")
  }).toThrow("security violation")
})
```

### Input Validation Tests

Test input sanitization:

```typescript
it("should handle malicious input safely", () => {
  const maliciousInput = "'; rm -rf /; echo '"

  expect(() => {
    execSync(`fopen add "${maliciousInput}" /tmp`)
  }).toThrow("Invalid project name")
})
```

## Debugging Tests

### Test Debugging

```bash
# Run with verbose output
pnpm test --reporter=verbose

# Run specific test with debugging
pnpm test --reporter=verbose tests/contract/url-parsing.test.ts

# Debug mode
node --inspect-brk ./node_modules/vitest/vitest.mjs run
```

### Common Issues

**Tests hanging**: Usually due to unclosed processes or file handles
**Permission errors**: Check test file cleanup and permissions
**Path issues**: Verify test uses absolute paths and proper cleanup

## Writing New Tests

### Checklist for New Tests

- [ ] Follows TDD approach (test first)
- [ ] Tests the public interface, not implementation
- [ ] Includes both success and error cases
- [ ] Uses appropriate test type (contract/integration/unit)
- [ ] Cleans up test data and environment
- [ ] Runs quickly (< 1 second per test)
- [ ] Is deterministic (same result every time)
- [ ] Uses descriptive test names

### Test Naming Convention

```typescript
// Good test names
it("should add project successfully with valid path")
it("should reject path traversal attempts")
it("should handle missing configuration gracefully")

// Poor test names
it("should work")
it("test add command")
it("error case")
```

This comprehensive testing approach ensures reliability, security, and cross-platform compatibility of the File Opener CLI tool.