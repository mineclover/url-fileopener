# File Opener CLI Tool

A powerful command-line interface for opening local files via custom URL scheme (`fileopener://`). This tool enables developers to create clickable links that open specific files in their local editor directly from web pages, documentation, or shared links.

## ✨ Features

- 🔗 **Custom URL Protocol**: Register `fileopener://` scheme with your operating system
- 📁 **Project Aliases**: Map project names to local directory paths
- 🖥️ **Cross-Platform**: Works on macOS, Windows, and Linux
- 🔒 **Security**: Built-in path traversal protection
- 🔄 **Dual URL Formats**: Supports both modern and legacy URL formats
- ⚙️ **Configuration Management**: Easy project setup and management
- 🛡️ **Error Handling**: Comprehensive error messages and validation

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd url-fileopener

# Install dependencies
pnpm install

# Build the CLI
pnpm build

# Install globally (optional)
pnpm link --global
```

### Basic Usage

```bash
# 1. Register the protocol with your system
fopen install

# 2. Add a project alias
fopen add myproject /path/to/your/project

# 3. Open files using URLs
fopen open "fileopener://myproject/src/index.js"

# 4. List configured projects
fopen list

# 5. Open configuration file
fopen config
```

## 📚 Commands Reference

### `fopen install`
Registers the `fileopener://` protocol with your operating system and creates the configuration directory.

```bash
fopen install
```

**Output:**
```
Installing file opener protocol...
Configuration directory created
Protocol registered successfully
Configuration directory: ~/.protocol-registry
```

### `fopen add <project> <path>`
Adds a new project alias mapping a name to a local directory path.

```bash
fopen add myproject /Users/username/projects/my-project
fopen add docs /Users/username/documents
```

**Validation:**
- Checks if the specified path exists
- Converts relative paths to absolute paths
- Updates existing project aliases

### `fopen list`
Lists all configured project aliases and their paths.

```bash
fopen list
```

**Output:**
```
Configured projects:
  myproject -> /Users/username/projects/my-project
  docs -> /Users/username/documents
```

### `fopen remove <project>`
Removes a project alias from the configuration.

```bash
fopen remove myproject
```

**Output:**
```
Project 'myproject' removed successfully
```

### `fopen open <url>`
Opens a file using the `fileopener://` URL format.

```bash
# Modern format
fopen open "fileopener://myproject/src/index.js"

# Legacy format (query parameter)
fopen open "fileopener://myproject?path=src/index.js"

# Files with spaces (URL encoded)
fopen open "fileopener://myproject/file%20with%20spaces.txt"
```

### `fopen config`
Opens the configuration file in your default editor.

```bash
fopen config
```

### `fopen uninstall`
Unregisters the protocol from your system.

```bash
fopen uninstall

# With cleanup (removes configuration files)
fopen uninstall --clean
```

## 🔗 URL Formats

### Modern Format (Recommended)
```
fileopener://project-name/path/to/file.ext
```

**Examples:**
```
fileopener://myproject/README.md
fileopener://myproject/src/components/Button.tsx
fileopener://docs/api/reference.md
```

### Legacy Format (Query Parameter)
```
fileopener://project-name?path=path/to/file.ext
```

**Examples:**
```
fileopener://myproject?path=README.md
fileopener://myproject?path=src/components/Button.tsx
```

### URL Encoding
Special characters in file paths should be URL encoded:

| Character | Encoded |
|-----------|---------|
| Space     | `%20`   |
| Hash      | `%23`   |
| Percent   | `%25`   |

**Example:**
```
fileopener://myproject/my%20file%20with%20spaces.txt
```

## ⚙️ Configuration

### Configuration Directory
```
~/.protocol-registry/
├── config.json          # Project aliases configuration
└── log.txt              # Operation logs (when available)
```

### Configuration File Format
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

## 🔒 Security Features

### Path Traversal Protection
The tool prevents access to files outside the configured project directories:

```bash
# ❌ These will be blocked:
fopen open "fileopener://myproject/../../../etc/passwd"
fopen open "fileopener://myproject/../../sensitive-file.txt"
```

### File Validation
- Checks if the target file exists before attempting to open
- Validates project aliases exist in configuration
- Ensures resolved paths remain within project boundaries

### Error Handling
Comprehensive error messages for various scenarios:
- Non-existent files or projects
- Invalid URL formats
- Path traversal attempts
- Missing configuration

## 🖥️ Platform Support

### macOS
Uses `open` command to open files with default applications.

### Windows
Uses `start` command to open files with default applications.

### Linux
Uses `xdg-open` command to open files with default applications.

## 🛠️ Development

### Project Structure
```
src/
├── models/              # Data models (Effect Schema)
│   ├── ProjectConfig.ts
│   ├── FileOpenRequest.ts
│   ├── CommandResult.ts
│   └── LogEntry.ts
├── services/            # Business logic services
│   ├── protocol-handler/    # Protocol registration
│   ├── config-manager/      # Configuration management
│   ├── file-opener/         # URL parsing & file operations
│   └── logging/             # Structured logging
├── cli/                 # CLI command implementations
│   ├── commands/
│   └── index.ts
└── bin/                 # Executable binaries
    ├── fopen-handler.ts # URL handler binary
    └── bin.ts           # Main CLI entry point

tests/
├── contract/            # Contract tests (TDD)
├── integration/         # Integration tests
└── unit/               # Unit tests
```

### Technology Stack
- **Framework**: Effect CLI with TypeScript
- **Protocol Registration**: protocol-registry package
- **Configuration**: JSON files with atomic operations
- **Testing**: Vitest with comprehensive test coverage
- **Build**: tsup for TypeScript compilation

### Building from Source
```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the project
pnpm build

# Run linting
pnpm lint

# Type checking
pnpm check
```

### Testing
```bash
# Run all tests
pnpm test

# Run with coverage
pnpm coverage

# Run specific test suites
pnpm test tests/contract/
pnpm test tests/integration/
```

## 🔍 Troubleshooting

### Common Issues

#### Protocol Not Registered
**Problem**: URLs don't open or system doesn't recognize `fileopener://`

**Solution:**
```bash
# Re-register the protocol
fopen uninstall
fopen install
```

#### File Not Opening
**Problem**: File exists but doesn't open

**Solutions:**
1. Check project configuration:
   ```bash
   fopen list
   fopen config  # Verify paths in configuration
   ```

2. Verify file path:
   ```bash
   # Test with absolute path first
   fopen open "fileopener://myproject/README.md"
   ```

3. Check for special characters:
   ```bash
   # Use URL encoding for special characters
   fopen open "fileopener://myproject/file%20with%20spaces.txt"
   ```

#### Permission Issues
**Problem**: Access denied or permission errors

**Solutions:**
1. Check directory permissions
2. Ensure user has read access to project files
3. Verify configuration directory permissions:
   ```bash
   ls -la ~/.protocol-registry/
   ```

### Debug Mode
For detailed troubleshooting, check the configuration and logs:

```bash
# Open configuration file
fopen config

# Check project listings
fopen list

# Verify file exists
ls -la /path/to/your/project/file.ext
```

## 📖 Use Cases

### Documentation Links
Create clickable links in documentation that open source files:

```markdown
Check the [main component](fileopener://myproject/src/components/Main.tsx)
or review the [API implementation](fileopener://myproject/src/api/users.ts).
```

### Code Reviews
Share direct links to specific files during code reviews:

```
fileopener://project/src/features/authentication/login.ts
fileopener://project/tests/unit/auth.test.ts
```

### Project Navigation
Quick access to frequently used files:

```bash
# Open main configuration
fileopener://myproject/package.json

# Open documentation
fileopener://myproject/README.md

# Open entry point
fileopener://myproject/src/index.ts
```

### Integration with Tools
Integrate with development tools, IDEs, or documentation systems to provide direct file access.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the TDD approach
4. Add tests for new functionality
5. Ensure all tests pass: `pnpm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines
- Follow Test-Driven Development (TDD)
- Write tests before implementation
- Maintain high test coverage
- Use TypeScript for type safety
- Follow Effect framework patterns
- Include comprehensive error handling

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Links

- [Effect CLI Documentation](https://effect.website/docs/cli)
- [Protocol Registry Package](https://github.com/mineclover/protocol-registry)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Created with ❤️ using Effect CLI framework and TypeScript**
