# Quickstart Guide: File Opener CLI Tool

**Feature**: File Opener CLI Tool
**Date**: 2025-09-15

## Installation

### 1. Install from npm (Global)
```bash
npm install -g fopen
```

### 2. Verify Installation
```bash
fopen --version
fopen --help
```

**Expected Output**:
```
fopen version 1.0.0
Usage: fopen <command> [options]

Commands:
  install                    Register fileopener:// protocol
  add <alias> [path]         Add project alias
  list                       List configured projects
  remove <alias>             Remove project alias
  uninstall                  Unregister protocol

Options:
  --help, -h                 Show help
  --version, -v              Show version
  --verbose                  Enable verbose output
  --format <json|text>       Output format
```

## Quick Setup (5 minutes)

### Step 1: Register Protocol
```bash
fopen install
```

**Expected Output**:
```
✅ Protocol 'fileopener://' registered successfully
ℹ️  You can now open files using fileopener:// URLs
```

### Step 2: Add Your First Project
```bash
# From within your project directory
cd /path/to/your/project
fopen add my-project

# Or specify path explicitly
fopen add my-project /path/to/your/project
```

**Expected Output**:
```
✅ Project 'my-project' added successfully
   → /path/to/your/project
```

### Step 3: Verify Configuration
```bash
fopen list
```

**Expected Output**:
```
Configured Projects:
- my-project: /path/to/your/project
```

### Step 4: Test File Opening
```bash
# macOS/Linux
open "fileopener://my-project/README.md"

# Windows
start "fileopener://my-project/README.md"
```

**Expected Behavior**: README.md file opens in your default editor

## Usage Examples

### Adding Multiple Projects
```bash
fopen add website /var/www/mysite
fopen add api /home/user/api-server
fopen add mobile-app /Users/dev/MyApp
```

### Using Different URL Formats
```bash
# Modern format (preferred)
fileopener://website/public/index.html
fileopener://api/src/routes/users.js
fileopener://mobile-app/src/components/Button.tsx

# Legacy format (backward compatibility)
fileopener://website?path=public/index.html
fileopener://api?path=src/routes/users.js
```

### Opening Configuration File
```bash
# Special URL to edit configuration directly
open "fileopener://config"
```

### Project Management
```bash
# List all projects
fopen list

# Remove a project
fopen remove old-project

# Add project with confirmation for existing alias
fopen add website /new/path/to/website --force
```

## Integration Examples

### In Documentation (Markdown)
```markdown
Check the [main configuration file](fileopener://my-project/config/app.json)
for settings, or review the [user controller](fileopener://my-project/src/controllers/users.js).
```

### In Issue Templates
```markdown
## Steps to Reproduce
1. Open [problematic component](fileopener://project-name/src/components/Problem.tsx)
2. Navigate to line 45 where the bug occurs
3. Check related [test file](fileopener://project-name/tests/components/Problem.test.tsx)
```

### In Development Scripts
```bash
#!/bin/bash
# Open all related files for feature development
open "fileopener://my-app/src/components/NewFeature.tsx"
open "fileopener://my-app/src/tests/NewFeature.test.tsx"
open "fileopener://my-app/docs/features/new-feature.md"
```

### Web Integration
Use the web redirect service for browser-based file opening:
```html
<a href="https://fileopener-redirect.astralclover.workers.dev/my-project/src/index.js">
  Open source file
</a>
```

## Troubleshooting

### Protocol Not Working
1. Verify protocol registration:
   ```bash
   fopen install --verbose
   ```

2. Check if another application claimed the protocol:
   ```bash
   fopen install --override
   ```

### Project Not Found
1. List configured projects:
   ```bash
   fopen list
   ```

2. Add missing project:
   ```bash
   fopen add project-name /path/to/project
   ```

### File Not Opening
1. Check file exists:
   ```bash
   ls "/resolved/path/to/file"
   ```

2. Verify project path is correct:
   ```bash
   fopen list
   cd /path/shown/in/list
   ls relative/file/path
   ```

### Security Errors
Path traversal attempts are blocked for security:
```bash
# ❌ This will fail (security violation)
fileopener://my-project/../../../etc/passwd

# ✅ This will work (within project)
fileopener://my-project/src/config.js
```

### Check Logs
```bash
# View recent operations
tail -f ~/.protocol-registry/log.txt

# Search for errors
grep "error" ~/.protocol-registry/log.txt
```

## Advanced Usage

### JSON Output for Scripts
```bash
# Get project list in JSON format
fopen list --format json

# Add project with JSON response
fopen add new-project /path --format json
```

### Verbose Mode for Debugging
```bash
# Enable detailed output
fopen install --verbose
fopen add project /path --verbose
```

### Batch Configuration
```bash
#!/bin/bash
# Script to configure multiple projects
projects=(
  "frontend:/home/user/web/frontend"
  "backend:/home/user/web/backend"
  "mobile:/home/user/mobile-app"
)

for project in "${projects[@]}"; do
  IFS=":" read -r name path <<< "$project"
  fopen add "$name" "$path"
done
```

## Clean Uninstall

When you no longer need the file opener:

```bash
# Remove protocol registration and configuration
fopen uninstall

# Keep configuration files (optional)
fopen uninstall --keep-config

# Uninstall npm package
npm uninstall -g fopen
```

## Testing Your Setup

### Validation Checklist
- [ ] `fopen --version` shows version number
- [ ] `fopen install` completes without errors
- [ ] `fopen add test-project` adds current directory
- [ ] `fopen list` shows the test project
- [ ] `fileopener://test-project/package.json` opens package.json
- [ ] `fopen remove test-project` removes the project
- [ ] `fopen uninstall` removes protocol registration

### Success Criteria
All quickstart steps complete without errors, and you can successfully open files using fileopener:// URLs from your browser, documentation, or command line.

**Setup Time**: ~5 minutes
**Learning Curve**: Minimal (standard CLI patterns)
**Maintenance**: None (configuration persists across reboots)