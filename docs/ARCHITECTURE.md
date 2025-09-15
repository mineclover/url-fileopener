# Architecture Documentation

## Overview

The File Opener CLI is built using the Effect framework with TypeScript, following functional programming principles and domain-driven design patterns.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CLI Layer     │    │  Service Layer  │    │  System Layer   │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │  Commands   │ │───▶│ │  Business   │ │───▶│ │ File System │ │
│ │             │ │    │ │   Logic     │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ URL Handler │ │───▶│ │ URL Parsing │ │───▶│ │  Protocol   │ │
│ │             │ │    │ │             │ │    │ │ Registry    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Principles

### Effect Framework
- **Type Safety**: Leverages Effect's type system for compile-time guarantees
- **Error Handling**: Structured error handling with Effect's error types
- **Dependency Injection**: Services are provided through Effect's context system
- **Functional Composition**: Pure functions composed through Effect pipelines

### Domain-Driven Design
- **Models**: Core domain entities with Effect Schema validation
- **Services**: Business logic encapsulated in service interfaces
- **Separation of Concerns**: Clear boundaries between layers

### Test-Driven Development
- **Contract Tests**: API behavior verification
- **Integration Tests**: End-to-end workflow validation
- **TDD Cycle**: Red-Green-Refactor development approach

## Layer Architecture

### 1. CLI Layer (`src/cli/`)

**Responsibility**: User interface and command processing

**Components**:
- `index.ts` - Main CLI orchestration
- `commands/` - Individual command implementations

**Key Features**:
- Command parsing and validation
- User interaction and feedback
- Error message formatting
- Help and usage information

**Dependencies**: Service Layer

### 2. Service Layer (`src/services/`)

**Responsibility**: Business logic implementation

#### Protocol Handler (`protocol-handler/`)
```typescript
interface ProtocolHandler {
  register(): Effect<CommandResult, Error>
  unregister(): Effect<CommandResult, Error>
  isRegistered(): Effect<boolean, Error>
}
```

**Purpose**: Manages system protocol registration
**Dependencies**: protocol-registry package

#### Config Manager (`config-manager/`)
```typescript
interface ConfigManager {
  getConfig(): Effect<ProjectConfig, Error>
  saveConfig(config: ProjectConfig): Effect<void, Error>
  addProject(name: string, path: string): Effect<void, Error>
  removeProject(name: string): Effect<boolean, Error>
  getProjectPath(name: string): Effect<string | undefined, Error>
  listProjects(): Effect<Record<string, string>, Error>
}
```

**Purpose**: Configuration file management
**Dependencies**: File System

#### File Opener (`file-opener/`)

**URL Parser**:
```typescript
interface UrlParser {
  parseUrl(url: string): Effect<FileOpenRequest, Error>
}
```

**Path Resolver**:
```typescript
interface PathResolver {
  resolvePath(projectPath: string, filePath: string): Effect<string, Error>
  validatePath(projectPath: string, filePath: string): Effect<string, Error>
}
```

**File Operations**:
```typescript
interface FileOperations {
  openFile(filePath: string): Effect<void, Error>
  fileExists(filePath: string): Effect<boolean, Error>
}
```

**Purpose**: URL processing and file operations
**Dependencies**: File System, OS commands

#### Logger (`logging/`)
```typescript
interface Logger {
  log(level: LogLevel, message: string, source: string, context?: Record<string, unknown>): Effect<void, Error>
  info(message: string, source: string, context?: Record<string, unknown>): Effect<void, Error>
  warn(message: string, source: string, context?: Record<string, unknown>): Effect<void, Error>
  error(message: string, source: string, context?: Record<string, unknown>): Effect<void, Error>
  debug(message: string, source: string, context?: Record<string, unknown>): Effect<void, Error>
}
```

**Purpose**: Structured logging and audit trail
**Dependencies**: File System

### 3. Model Layer (`src/models/`)

**Responsibility**: Domain entity definitions and validation

#### ProjectConfig
```typescript
interface ProjectConfig {
  projects: Record<string, string>
  version: string
  lastUpdated: string
}
```

#### FileOpenRequest
```typescript
interface FileOpenRequest {
  url: string
  project: string
  filePath: string
  resolvedPath?: string
  timestamp: string
}
```

#### CommandResult
```typescript
interface CommandResult {
  success: boolean
  message: string
  command: string
  data?: unknown
  error?: string
  timestamp: string
}
```

#### LogEntry
```typescript
interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  timestamp: string
  source: string
}
```

### 4. Binary Layer (`src/bin/`)

**Responsibility**: Executable entry points

- `bin.ts` - Main CLI entry point
- `fopen-handler.ts` - URL handler binary for protocol registration

## Data Flow

### Command Execution Flow

```
User Input
    │
    ▼
CLI Command Parser
    │
    ▼
Command Implementation
    │
    ▼
Service Layer
    │
    ▼
Effect Pipeline
    │
    ▼
System Operations
    │
    ▼
Result/Error
```

### URL Handling Flow

```
fileopener:// URL
    │
    ▼
URL Parser Service
    │
    ▼
Path Resolver Service
    │
    ▼
Security Validation
    │
    ▼
File Operations Service
    │
    ▼
System File Opening
```

### Configuration Flow

```
CLI Command
    │
    ▼
Config Manager Service
    │
    ▼
File System Operations
    │
    ▼
JSON Configuration
    │
    ▼
Atomic Write/Read
```

## Security Architecture

### Input Validation
- **URL Parsing**: Strict URL format validation
- **Path Validation**: Path traversal prevention
- **Project Validation**: Name sanitization

### Path Security
```typescript
// Security checks implemented in PathResolver
1. Normalize input paths
2. Resolve absolute paths
3. Check path boundaries
4. Validate against project directory
5. Prevent symbolic link exploitation
```

### Error Handling
- **Information Disclosure**: Prevent sensitive path leakage
- **Error Messages**: User-friendly without system details
- **Logging**: Secure audit trail without sensitive data

## Dependency Management

### External Dependencies
- **Effect Framework**: Core functional programming framework
- **protocol-registry**: System protocol registration
- **@effect/platform**: Platform abstraction layer
- **@effect/cli**: CLI framework

### Dependency Injection
```typescript
// Service composition through Effect context
const program = Effect.gen(function* () {
  const protocolHandler = yield* ProtocolHandler
  const configManager = yield* ConfigManager
  const logger = yield* Logger

  // Business logic using injected services
}).pipe(
  Effect.provide(ProtocolHandlerLive),
  Effect.provide(ConfigManagerLive),
  Effect.provide(LoggerLive)
)
```

## Error Handling Strategy

### Error Types
- **ValidationError**: Input validation failures
- **FileSystemError**: File operation failures
- **SecurityError**: Security violation attempts
- **ConfigError**: Configuration issues
- **ProtocolError**: Protocol registration failures

### Error Recovery
```typescript
// Graceful degradation example
const result = yield* configManager.getConfig().pipe(
  Effect.catchAll((error) =>
    Effect.succeed(defaultProjectConfig())
  )
)
```

### Error Reporting
- **User Errors**: Clear, actionable messages
- **System Errors**: Logged with context for debugging
- **Security Errors**: Logged with security context

## Performance Considerations

### Response Time Targets
- **CLI Commands**: < 100ms
- **File Opening**: < 200ms
- **Protocol Registration**: < 1000ms

### Optimization Strategies
- **Lazy Loading**: Services loaded on demand
- **Caching**: Configuration cached in memory
- **Async Operations**: Non-blocking file operations
- **Resource Management**: Proper cleanup and disposal

## Cross-Platform Support

### Platform Abstraction
```typescript
// Platform-specific implementations
const fileOperations = Platform.current === "darwin"
  ? MacOSFileOperations
  : Platform.current === "win32"
  ? WindowsFileOperations
  : LinuxFileOperations
```

### Protocol Registration
- **macOS**: System preferences integration
- **Windows**: Registry-based registration
- **Linux**: Desktop file association

## Monitoring and Observability

### Logging Strategy
- **Structured Logging**: JSON-formatted log entries
- **Log Levels**: DEBUG, INFO, WARN, ERROR
- **Contextual Information**: Operation context and metadata
- **Audit Trail**: Security-relevant operations logged

### Metrics (Future)
- **Command Usage**: Frequency and performance metrics
- **Error Rates**: Command failure tracking
- **Performance**: Response time distribution

## Testing Architecture

### Test Organization
```
tests/
├── contract/     # API contract validation
├── integration/  # End-to-end workflows
└── unit/        # Component isolation
```

### Test Strategy
- **TDD Approach**: Tests drive implementation
- **Real Dependencies**: Authentic validation when possible
- **Isolation**: Independent test execution
- **Cross-Platform**: Multiple OS testing

## Build and Deployment

### Build Pipeline
```typescript
// tsup configuration
export default defineConfig({
  entry: ["src/bin.ts", "src/bin/fopen-handler.ts"],
  format: ["cjs"],
  target: "node18",
  clean: true
})
```

### Distribution
- **NPM Package**: Global CLI installation
- **Binary Executables**: Platform-specific binaries
- **Documentation**: Comprehensive user guides

## Future Architecture Considerations

### Extensibility
- **Plugin System**: Custom protocol handlers
- **Configuration Schema**: Versioned configuration format
- **API Expansion**: Additional file operation commands

### Scalability
- **Configuration Size**: Large project collections
- **Performance**: Optimized file operations
- **Caching**: Intelligent caching strategies

### Integration
- **IDE Plugins**: Editor integrations
- **CI/CD**: Build system integration
- **Development Tools**: Enhanced developer workflow

This architecture provides a solid foundation for a maintainable, secure, and extensible file opener CLI tool.