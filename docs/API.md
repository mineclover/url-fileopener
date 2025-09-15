# API Documentation

## CLI Commands API

### Command Structure

All commands follow the pattern:
```bash
fopen <command> [arguments] [options]
```

## Commands

### install

Registers the `fileopener://` protocol with the operating system.

```bash
fopen install
```

**Returns:**
- Exit code 0 on success
- Exit code 1 on failure

**Side effects:**
- Creates `~/.protocol-registry/` directory
- Registers protocol handler with OS
- Creates default configuration file

---

### add

Adds a project alias to the configuration.

```bash
fopen add <project-name> <project-path>
```

**Parameters:**
- `project-name` (string): Unique identifier for the project
- `project-path` (string): Absolute or relative path to project directory

**Validation:**
- `project-name` must be non-empty
- `project-path` must exist
- `project-path` is converted to absolute path

**Returns:**
- Exit code 0 on success
- Exit code 1 on failure (invalid path, permissions, etc.)

**Examples:**
```bash
fopen add myproject /Users/username/projects/my-project
fopen add docs ./documentation
```

---

### list

Lists all configured project aliases.

```bash
fopen list
```

**Output format:**
```
Configured projects:
  project1 -> /absolute/path/to/project1
  project2 -> /absolute/path/to/project2
```

**Empty state:**
```
No projects configured
```

---

### remove

Removes a project alias from configuration.

```bash
fopen remove <project-name>
```

**Parameters:**
- `project-name` (string): Name of project to remove

**Returns:**
- Exit code 0 on success (removed or not found)
- Confirmation message indicates whether project existed

---

### open

Opens a file using `fileopener://` URL.

```bash
fopen open <url>
```

**Parameters:**
- `url` (string): `fileopener://` URL to process

**URL Formats:**

**Modern format:**
```
fileopener://project-name/path/to/file.ext
```

**Legacy format:**
```
fileopener://project-name?path=path/to/file.ext
```

**Validation:**
- URL must use `fileopener://` protocol
- Project must exist in configuration
- File path must exist
- Resolved path must be within project directory (security)

**Returns:**
- Exit code 0 on success
- Exit code 1 on failure (invalid URL, file not found, security violation)

---

### config

Opens the configuration file in the default editor.

```bash
fopen config
```

**Behavior:**
- Opens `~/.protocol-registry/config.json`
- Uses system default editor for JSON files
- Creates configuration file if it doesn't exist

---

### uninstall

Unregisters the protocol from the operating system.

```bash
fopen uninstall [--clean]
```

**Options:**
- `--clean` or `-c`: Also remove configuration files

**Returns:**
- Exit code 0 on success
- Exit code 1 on failure

## URL Processing API

### URL Parsing

The URL parser handles both modern and legacy formats:

```typescript
interface ParsedURL {
  project: string;
  filePath: string;
  url: string;
}
```

### Path Resolution

Security-aware path resolution:

```typescript
interface PathResolution {
  projectPath: string;
  filePath: string;
  resolvedPath: string;
  isValid: boolean;
}
```

**Security checks:**
1. Path traversal prevention (`../` sequences)
2. Absolute path rejection
3. Project boundary enforcement
4. File existence validation

## Configuration API

### Configuration Structure

```typescript
interface ProjectConfig {
  projects: Record<string, string>;
  version: string;
  lastUpdated: string;
}
```

### File Location

- **Config Directory**: `~/.protocol-registry/`
- **Config File**: `~/.protocol-registry/config.json`
- **Log File**: `~/.protocol-registry/log.txt` (when logging enabled)

### Example Configuration

```json
{
  "projects": {
    "myproject": "/Users/username/projects/my-project",
    "docs": "/Users/username/documents",
    "website": "/Users/username/sites/website"
  },
  "version": "1.0.0",
  "lastUpdated": "2025-09-15T03:50:44.475Z"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | File not found |
| 4 | Permission denied |
| 5 | Security violation |

## Platform-Specific Behavior

### macOS
- Uses `open` command for file opening
- Protocol registration via system preferences

### Windows
- Uses `start` command for file opening
- Protocol registration via registry

### Linux
- Uses `xdg-open` command for file opening
- Protocol registration via desktop files

## Exit Codes and Error Handling

### Success Cases
- Command completed successfully: Exit code 0
- Informational messages printed to stdout

### Error Cases
- Invalid arguments: Exit code 1, usage message
- File/project not found: Exit code 1, descriptive error
- Security violations: Exit code 1, security warning
- System errors: Exit code 1, error description

### Error Message Format

All error messages follow the pattern:
```
Error: <description>
```

Informational messages are printed without prefix.

## Logging

When logging is enabled, operations are logged to `~/.protocol-registry/log.txt`:

```
[2025-09-15T03:50:44.475Z] INFO [add-command] Project 'myproject' added successfully
[2025-09-15T03:50:44.476Z] INFO [open-command] File opened successfully: /path/to/file.txt
[2025-09-15T03:50:44.477Z] ERROR [open-command] File not found: /path/to/missing.txt
```

## Security Considerations

### Path Traversal Prevention
- All `../` sequences are blocked
- Resolved paths must start with project directory
- Symbolic links are followed but final path is validated

### Input Validation
- Project names are validated (non-empty, reasonable length)
- Paths are normalized before processing
- URLs are properly parsed and validated

### File Access
- Only files within configured project directories are accessible
- File existence is verified before opening
- No arbitrary system file access