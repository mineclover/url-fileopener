# URL Handler Contract

**Feature**: File Opener CLI Tool
**Date**: 2025-09-15

## Protocol Handler Specification

### Protocol: `fileopener://`

**Description**: Custom URL protocol for opening local files in default editor

**Handler Command**: `fopen-handler <url>`
- Invoked by operating system when fileopener:// URL is activated
- Receives full URL as command line argument
- Returns absolute file path on success, error on failure

## URL Format Specification

### Modern Format (Preferred)
```
fileopener://<project-alias>/<relative-path>
```

**Examples**:
- `fileopener://my-app/src/index.js`
- `fileopener://website/public/index.html`
- `fileopener://protocol-registry/README.md`

### Legacy Format (Backward Compatibility)
```
fileopener://<project-alias>?path=<relative-path>
```

**Examples**:
- `fileopener://my-app?path=src/index.js`
- `fileopener://website?path=public/index.html`

### Special URLs
```
fileopener://config
```
- Opens the configuration file directly
- No path parameter needed

## URL Processing Contract

### Input Processing

**Function**: `parseUrl(urlString: string): FileOpenRequest`

**Input Validation**:
1. URL must start with "fileopener://"
2. URL must be properly encoded
3. Project alias must be alphanumeric + hyphens/underscores
4. File path must be relative (no leading /)

**Output**:
```typescript
interface FileOpenRequest {
  protocol: "fileopener";
  projectAlias: string;
  filePath: string;
  isLegacyFormat: boolean;
}
```

**Error Cases**:
- Invalid URL format
- Missing project alias
- Missing file path
- Invalid characters in project alias

### Path Resolution Contract

**Function**: `resolvePath(request: FileOpenRequest): string`

**Process**:
1. Look up project alias in configuration
2. Resolve relative file path against project base path
3. Validate resolved path is within project boundaries
4. Check file exists

**Security Validation**:
```typescript
const resolvedPath = path.resolve(projectBasePath, relativePath);
const resolvedBasePath = path.resolve(projectBasePath);

// Security check: prevent directory traversal
if (!resolvedPath.startsWith(resolvedBasePath + path.sep)) {
  throw new SecurityError("Path traversal attempt detected");
}
```

**Output**: Absolute file path string

**Error Cases**:
- Project alias not found in configuration
- Path traversal attempt (../ sequences)
- File does not exist
- Permission denied

### File Opening Contract

**Function**: `openFile(absolutePath: string): void`

**Process**:
1. Verify file exists and is readable
2. Determine appropriate application for file type
3. Launch system default application with file
4. Log operation result

**Platform Commands**:
- **macOS**: `open <file-path>`
- **Windows**: `start <file-path>`
- **Linux**: `xdg-open <file-path>`

**Output**: None (process launches external application)

**Error Cases**:
- File not found
- No default application for file type
- Permission denied
- System command failed

## Handler Response Contract

### Success Response
**Behavior**: Write absolute path to stdout and exit with code 0

**Format**:
```
/absolute/path/to/opened/file
```

**Example**:
```
/Users/developer/projects/my-app/src/index.js
```

### Error Response
**Behavior**: Write error message to stderr and exit with non-zero code

**Format**:
```
Error: <error-description>
```

**Examples**:
```
Error: Project "unknown-project" not found in configuration
Error: Security violation: Attempted to access file outside project directory
Error: File does not exist: /path/to/missing/file.js
```

## Logging Contract

### Log Entry Format
```typescript
interface LogEntry {
  timestamp: string;        // ISO 8601 format
  level: "info" | "error";
  operation: string;
  details: string;
  data?: Record<string, unknown>;
}
```

### Log File Location
- **Path**: `~/.protocol-registry/log.txt`
- **Format**: Append-only text file
- **Rotation**: No automatic rotation (manual management)

### Log Entry Examples

**Successful File Opening**:
```
2025-09-15T10:30:00.000Z: info - handle_url - Successfully opened file
  URL: fileopener://my-app/src/index.js
  Resolved: /Users/dev/my-app/src/index.js
```

**Error Handling**:
```
2025-09-15T10:31:00.000Z: error - handle_url - Path traversal attempt detected
  URL: fileopener://my-app/../../../etc/passwd
  Project: my-app
  Attempted path: ../../../etc/passwd
```

**Configuration Errors**:
```
2025-09-15T10:32:00.000Z: error - handle_url - Project not found
  URL: fileopener://unknown-project/file.js
  Available projects: my-app, website, protocol-registry
```

## Integration Contract

### Operating System Registration
```typescript
interface ProtocolRegistration {
  protocol: "fileopener";
  command: string;           // Path to handler executable
  override: boolean;         // Replace existing registration
  terminal: boolean;         // Keep terminal open
}
```

### Handler Executable
- **Location**: Determined by npm global installation
- **Name**: `fopen-handler` or `fopen-handler.exe` (Windows)
- **Invocation**: `fopen-handler "<full-url>"`

### Configuration Integration
- **Read**: Configuration file must be accessible to handler
- **Format**: Same JSON format as CLI configuration
- **Location**: `~/.protocol-registry/config/fileopener.json`

## Error Codes

- **0**: Success - file opened successfully
- **1**: General error - unspecified failure
- **2**: Invalid URL format
- **3**: Project not found in configuration
- **4**: File not found
- **5**: Security violation (path traversal)
- **6**: Permission denied
- **7**: No default application for file type