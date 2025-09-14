# File Opener CLI Development Guidelines

Auto-generated from feature plan. Last updated: 2025-09-15

## Active Technologies
- **Language/Version**: TypeScript/JavaScript (Node.js 18+)
- **CLI Framework**: Effect CLI framework
- **Protocol Registration**: protocol-registry (external package)
- **Configuration**: JSON files in ~/.protocol-registry/
- **Testing**: Effect testing framework with integration tests
- **Platform**: Cross-platform CLI (macOS, Windows, Linux)

## Project Structure
```
src/
├── models/           # Data models (ProjectConfig, FileOpenRequest, etc.)
├── services/         # Business logic services
│   ├── protocol-handler/    # Protocol registration/unregistration
│   ├── config-manager/      # Configuration file management
│   └── file-opener/         # URL parsing and file opening
├── cli/             # Effect CLI command definitions
└── lib/             # Shared utilities

tests/
├── contract/        # Contract tests for CLI commands
├── integration/     # Integration tests with real protocol registration
└── unit/           # Unit tests for individual components
```

## Commands

### fopen CLI Commands
- `fopen install` - Register fileopener:// protocol
- `fopen add <alias> [path]` - Add project alias
  - `--here` - Use current directory as project path
  - `--force` - Force overwrite existing project alias
- `fopen list` - List configured projects
- `fopen remove <alias>` - Remove project alias
- `fopen uninstall` - Unregister protocol

### Development Commands
- Test with actual protocol registration (not mocked)
- Follow TDD: RED-GREEN-Refactor cycle strictly
- Integration tests for all protocol operations

## Code Style

### TypeScript/Effect CLI
- Use Effect CLI patterns for command structure
- JSDoc type hints for better developer experience
- Structured error handling with detailed context
- Security-first approach with path traversal validation

### File Operations
```typescript
// Security validation example
const resolvedPath = path.resolve(projectBasePath, relativePath);
const resolvedBasePath = path.resolve(projectBasePath);
if (!resolvedPath.startsWith(resolvedBasePath + path.sep)) {
  throw new SecurityError("Path traversal attempt detected");
}
```

### Configuration Management
```typescript
// Configuration format
type ProjectConfig = {
  [projectAlias: string]: string; // absolute path
}
```

## Recent Changes
1. **002-file-opener-demo**: Initial implementation converting demo to CLI
   - Added protocol registration using external protocol-registry package
   - Implemented secure file opening with path traversal protection
   - Created CLI interface with install/add/list/remove/uninstall commands

2. **Added --here flag**: Enhanced add command with current directory registration
   - Added `--here` flag to register current directory without specifying path
   - Implemented conflict validation between `--here` flag and path argument
   - Added comprehensive test coverage for new functionality

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->