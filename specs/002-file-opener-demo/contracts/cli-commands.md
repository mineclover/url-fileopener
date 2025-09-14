# CLI Commands Contract

**Feature**: File Opener CLI Tool
**Date**: 2025-09-15

## Command Interface Specification

### Base Command: `fopen`

**Description**: File opener CLI tool for managing protocol registration and project configurations

**Global Options**:
- `--help, -h`: Show help information
- `--version, -v`: Show version information
- `--verbose`: Enable verbose logging output
- `--format <json|text>`: Output format (default: text)

### Commands

## 1. `fopen install`

**Description**: Register the fileopener:// protocol with the operating system

**Usage**: `fopen install [options]`

**Options**:
- `--override`: Override existing protocol registration (default: false)
- `--terminal`: Keep terminal open after protocol activation (default: false)

**Input**: None
**Output**:
```typescript
interface InstallResult {
  success: boolean;
  message: string;
  protocol: "fileopener";
  registered: boolean;
}
```

**Success Example**:
```json
{
  "success": true,
  "message": "Protocol 'fileopener://' registered successfully",
  "protocol": "fileopener",
  "registered": true
}
```

**Error Cases**:
- Permission denied for system protocol registration
- Protocol already registered by another application (without --override)
- Platform not supported

## 2. `fopen add <project-alias> [project-path]`

**Description**: Add a project alias mapping to a local directory path

**Usage**: `fopen add <project-alias> [project-path]`

**Arguments**:
- `project-alias`: Unique identifier for the project (required)
- `project-path`: Absolute path to project directory (optional, defaults to current directory)

**Options**:
- `--force`: Override existing project alias

**Input Validation**:
- `project-alias` must match pattern: `/^[a-zA-Z0-9_-]+$/`
- `project-alias` cannot be reserved: "config", "help", "version"
- `project-path` must be an existing directory
- `project-path` will be resolved to absolute path

**Output**:
```typescript
interface AddProjectResult {
  success: boolean;
  message: string;
  project: {
    alias: string;
    path: string;
  };
}
```

**Success Example**:
```json
{
  "success": true,
  "message": "Project 'my-app' added successfully",
  "project": {
    "alias": "my-app",
    "path": "/Users/developer/projects/my-app"
  }
}
```

**Error Cases**:
- Invalid project alias format
- Project path does not exist
- Project path is not a directory
- Project alias already exists (without --force)

## 3. `fopen list`

**Description**: List all configured project aliases and their paths

**Usage**: `fopen list [options]`

**Options**:
- `--json`: Output in JSON format
- `--paths-only`: Show only the paths
- `--aliases-only`: Show only the aliases

**Input**: None
**Output**:
```typescript
interface ListProjectsResult {
  success: boolean;
  message: string;
  projects: Array<{
    alias: string;
    path: string;
  }>;
  count: number;
}
```

**Success Example**:
```json
{
  "success": true,
  "message": "Found 2 configured projects",
  "projects": [
    {
      "alias": "my-app",
      "path": "/Users/developer/projects/my-app"
    },
    {
      "alias": "website",
      "path": "/var/www/mysite"
    }
  ],
  "count": 2
}
```

**Error Cases**:
- Configuration file not found or corrupted
- Permission denied reading configuration

## 4. `fopen remove <project-alias>`

**Description**: Remove a project alias from configuration

**Usage**: `fopen remove <project-alias>`

**Arguments**:
- `project-alias`: Project identifier to remove (required)

**Options**:
- `--force`: Skip confirmation prompt

**Input Validation**:
- `project-alias` must exist in configuration

**Output**:
```typescript
interface RemoveProjectResult {
  success: boolean;
  message: string;
  removed: {
    alias: string;
    path: string;
  } | null;
}
```

**Success Example**:
```json
{
  "success": true,
  "message": "Project 'my-app' removed successfully",
  "removed": {
    "alias": "my-app",
    "path": "/Users/developer/projects/my-app"
  }
}
```

**Error Cases**:
- Project alias not found
- Configuration file not writable

## 5. `fopen uninstall`

**Description**: Unregister the fileopener:// protocol from the operating system

**Usage**: `fopen uninstall [options]`

**Options**:
- `--force`: Skip confirmation prompt
- `--keep-config`: Keep configuration files (default: false)

**Input**: None
**Output**:
```typescript
interface UninstallResult {
  success: boolean;
  message: string;
  protocol: "fileopener";
  unregistered: boolean;
  configRemoved: boolean;
}
```

**Success Example**:
```json
{
  "success": true,
  "message": "Protocol 'fileopener://' unregistered successfully",
  "protocol": "fileopener",
  "unregistered": true,
  "configRemoved": true
}
```

**Error Cases**:
- Permission denied for system protocol unregistration
- Protocol not currently registered
- Configuration files could not be removed

## Error Response Format

All commands return errors in consistent format:

```typescript
interface ErrorResult {
  success: false;
  message: string;
  error: string;
  code?: string;
}
```

**Error Example**:
```json
{
  "success": false,
  "message": "Failed to add project",
  "error": "Directory '/invalid/path' does not exist",
  "code": "INVALID_PATH"
}
```

## Exit Codes

- `0`: Success
- `1`: General error
- `2`: Invalid arguments
- `3`: Permission denied
- `4`: File not found
- `5`: Configuration error