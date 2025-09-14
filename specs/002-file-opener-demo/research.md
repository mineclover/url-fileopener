# Phase 0: Research & Technical Decisions

**Feature**: File Opener CLI Tool
**Date**: 2025-09-15

## Research Areas

### 1. Effect CLI Framework Integration

**Decision**: Use Effect CLI framework as the base, removing all existing commands
**Rationale**:
- Provides structured CLI application architecture with TypeScript support
- Built-in command parsing, validation, and error handling
- Consistent with project's existing structure

**Alternatives considered**:
- Commander.js: Less structured, would require more boilerplate
- Yargs: Similar to commander but with different API design
- Native Node.js argv parsing: Too low-level, no validation

**Implementation approach**:
- Replace existing CLI commands in src/ with new fopen commands
- Maintain Effect CLI's architectural patterns for consistency
- Use Effect's built-in logging and error handling

### 2. Protocol Registry Package Integration

**Decision**: Use external `protocol-registry` package from GitHub
**Rationale**:
- User requirement to replace ../../src references
- Provides cross-platform protocol registration (Windows/macOS/Linux)
- Well-tested solution for system protocol handling

**Alternatives considered**:
- Local implementation: Would require platform-specific code for registry manipulation
- Other npm packages: Less mature or platform-specific only

**Integration approach**:
```javascript
const protocolRegistry = require('protocol-registry');
await protocolRegistry.register('fileopener', commandPath, options);
```

### 3. Configuration Management Strategy

**Decision**: JSON configuration files in ~/.protocol-registry/
**Rationale**:
- Maintains compatibility with existing demo configuration format
- Simple key-value mapping suitable for project aliases
- Standard location for CLI tools configuration

**Alternatives considered**:
- YAML format: More human-readable but adds dependency
- Database storage: Overkill for simple key-value mapping
- System registry: Platform-specific and more complex

**Configuration structure**:
```json
{
  "myproject": "/absolute/path/to/project",
  "another-project": "/path/to/another/project"
}
```

### 4. Security Model for Path Traversal Protection

**Decision**: Path resolution with boundary validation
**Rationale**:
- Security requirement FR-008 mandates path validation
- Prevents directory traversal attacks (../../../etc/passwd)
- Maintains user experience while ensuring security

**Implementation approach**:
```javascript
const resolvedPath = path.resolve(projectBasePath, relativePath);
const resolvedBasePath = path.resolve(projectBasePath);
if (!resolvedPath.startsWith(resolvedBasePath)) {
  throw new Error('Path traversal violation');
}
```

### 5. URL Format Support Strategy

**Decision**: Support both legacy and modern URL formats
**Rationale**:
- Backward compatibility requirement FR-012
- Gradual migration path for existing users

**Supported formats**:
- Modern: `fileopener://project/path/to/file`
- Legacy: `fileopener://project?path=path/to/file`

### 6. Error Handling and Logging Strategy

**Decision**: Structured logging with detailed error context
**Rationale**:
- Observability requirement from constitution
- Debugging requirement FR-014
- User-friendly error messages requirement FR-011

**Logging approach**:
- Operations logged to ~/.protocol-registry/log.txt
- ISO timestamp + operation + result/error
- Error messages include actionable guidance

### 7. Testing Strategy for System Integration

**Decision**: Integration tests with actual protocol registration
**Rationale**:
- Constitution requires real dependencies, not mocks
- Protocol registration is core functionality requiring system-level testing
- File operations need actual file system interaction

**Testing approach**:
- Contract tests for CLI commands
- Integration tests for protocol registration/deregistration
- E2E tests for complete file opening workflow
- Unit tests for URL parsing and validation logic

### 8. Cross-Platform Compatibility

**Decision**: Support macOS, Windows, and Linux
**Rationale**:
- Protocol-registry package provides cross-platform support
- CLI tools should work across development environments

**Platform-specific considerations**:
- macOS: Uses LaunchServices for protocol registration
- Windows: Registry modification for protocol association
- Linux: Desktop file creation for protocol handling

## Dependencies Resolution

**Primary Dependencies**:
- `protocol-registry`: ^1.4.0 (external package for protocol registration)
- `@effect/cli`: Latest (Effect CLI framework)
- `@effect/platform`: Latest (Effect platform utilities)

**Development Dependencies**:
- `@effect/vitest`: Testing framework
- `typescript`: TypeScript compiler
- `@types/node`: Node.js type definitions

**No unresolved dependencies**: All technical context items have been researched and decisions made.

## Risk Assessment

**Low Risk**:
- JSON configuration management
- URL parsing and validation
- CLI command structure

**Medium Risk**:
- Protocol registration across platforms (mitigated by using proven library)
- File system permissions (handled with proper error messages)

**High Risk**:
- Security vulnerabilities in path traversal (mitigated with comprehensive validation)

## Research Complete

All NEEDS CLARIFICATION items from Technical Context have been resolved:
✅ Language/Version: TypeScript/Node.js 18+
✅ Dependencies: Effect CLI + protocol-registry
✅ Testing: Effect testing with integration tests
✅ Platform: Cross-platform CLI
✅ Performance: <100ms response time
✅ Constraints: Remove existing commands, use external package
✅ Scale: Individual developer usage