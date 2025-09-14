# Data Model: File Opener CLI Tool

**Feature**: File Opener CLI Tool
**Date**: 2025-09-15

## Core Entities

### 1. ProjectConfig
**Purpose**: Represents the configuration mapping project aliases to file paths

**Fields**:
- `projects`: `Record<string, string>` - Map of project alias to absolute path
  - Key: Project alias (alphanumeric, hyphens, underscores)
  - Value: Absolute file system path to project root

**Validation Rules**:
- Project alias must match pattern: `/^[a-zA-Z0-9_-]+$/`
- Project alias cannot be reserved words: "config", "help", "version"
- Project path must be absolute path
- Project path must exist on file system
- Project path must be a directory (not a file)

**State Transitions**:
- Empty → Contains projects (via add command)
- Contains projects → Updated projects (via add/remove commands)
- Contains projects → Empty (via multiple remove commands)

**Example**:
```json
{
  "my-app": "/Users/developer/projects/my-app",
  "protocol-registry": "/Users/developer/libs/protocol-registry",
  "website": "/var/www/mysite"
}
```

### 2. FileOpenRequest
**Purpose**: Represents a request to open a file via the fileopener:// protocol

**Fields**:
- `protocol`: `"fileopener"` - Fixed protocol name
- `projectAlias`: `string` - Project identifier from URL
- `filePath`: `string` - Relative path within project
- `queryParams`: `Record<string, string>` - Legacy format support

**Validation Rules**:
- `projectAlias` must exist in ProjectConfig
- `filePath` must be relative (no leading /)
- `filePath` cannot contain path traversal sequences (../)
- Final resolved path must be within project boundary

**URL Format Examples**:
- Modern: `fileopener://myproject/src/index.js`
  - projectAlias: "myproject"
  - filePath: "src/index.js"
- Legacy: `fileopener://myproject?path=src/index.js`
  - projectAlias: "myproject"
  - filePath: "src/index.js" (from query parameter)

### 3. CommandResult
**Purpose**: Standardized result for CLI command operations

**Fields**:
- `success`: `boolean` - Whether operation succeeded
- `message`: `string` - Human-readable result message
- `data`: `unknown` - Optional command-specific data
- `error`: `string | undefined` - Error message if failed

**States**:
- Success: `{ success: true, message: "...", data?: any }`
- Error: `{ success: false, message: "...", error: "..." }`

### 4. LogEntry
**Purpose**: Represents a single log entry for debugging

**Fields**:
- `timestamp`: `string` - ISO timestamp
- `level`: `"info" | "error" | "debug"` - Log level
- `operation`: `string` - Operation being performed
- `details`: `string` - Operation details or error message
- `data`: `Record<string, unknown>` - Optional structured data

**Example**:
```json
{
  "timestamp": "2025-09-15T10:30:00.000Z",
  "level": "info",
  "operation": "open_file",
  "details": "Successfully opened file",
  "data": {
    "project": "my-app",
    "file": "src/index.js",
    "resolvedPath": "/Users/dev/my-app/src/index.js"
  }
}
```

## Relationships

```
ProjectConfig 1 --- * FileOpenRequest
  (project alias maps to base path for file resolution)

CommandResult 1 --- 0..1 LogEntry
  (each command may generate log entries)

FileOpenRequest 1 --- 1 LogEntry
  (each file open attempt is logged)
```

## Data Flow

1. **Configuration Flow**:
   ```
   User Input → Validation → ProjectConfig → File System
   ```

2. **File Opening Flow**:
   ```
   URL → FileOpenRequest → ProjectConfig Lookup → Path Resolution → Security Check → File Operation → LogEntry
   ```

3. **Command Flow**:
   ```
   CLI Input → Command Parsing → Operation → CommandResult → Console Output + LogEntry
   ```

## Storage Schema

### Configuration File: `~/.protocol-registry/config/fileopener.json`
```typescript
type ConfigFile = {
  [projectAlias: string]: string; // absolute path
}
```

### Log File: `~/.protocol-registry/log.txt`
```
[ISO Timestamp]: [Level] - [Operation] - [Details]
```

Example:
```
2025-09-15T10:30:00.000Z: info - add_project - Added project "my-app" -> "/Users/dev/my-app"
2025-09-15T10:31:00.000Z: error - open_file - File not found: /Users/dev/my-app/missing.js
```

## Validation Constraints

### Security Constraints
1. **Path Traversal Prevention**:
   ```typescript
   const resolvedPath = path.resolve(projectBasePath, filePath);
   const resolvedBasePath = path.resolve(projectBasePath);
   if (!resolvedPath.startsWith(resolvedBasePath + path.sep)) {
     throw new SecurityError("Path traversal attempt detected");
   }
   ```

2. **File System Access**:
   - Only allow access to files within configured project boundaries
   - Validate file existence before attempting to open
   - Log all file access attempts for security audit

### Business Logic Constraints
1. **Project Alias Uniqueness**: Each alias maps to exactly one path
2. **Path Uniqueness**: Each path can have multiple aliases (allowed)
3. **URL Decoding**: Handle encoded characters in URLs properly
4. **Case Sensitivity**: Project aliases are case-sensitive

## Error Scenarios

### Configuration Errors
- Invalid project alias format → Validation error
- Non-existent project path → File system error
- Permission denied on config directory → Permission error
- Malformed JSON configuration → Parse error

### File Opening Errors
- Unknown project alias → Configuration error
- Path traversal attempt → Security error
- File does not exist → File system error
- No default application for file type → System error

### Protocol Errors
- Protocol not registered → Installation error
- Invalid URL format → Parse error
- Permission denied for protocol registration → System error