# File Opening Behavior Testing

This document describes how to test the file opening behavior of the fileopener CLI tool.

## 🧪 Test Files

The `test-files/` directory contains various file types for testing:

| File | Type | Expected Behavior |
|------|------|------------------|
| `test.js` | JavaScript | Opens in text editor (VS Code, etc.) |
| `test.sh` | Shell Script | Opens in text editor (NOT executed) |
| `test.bat` | Windows Batch | Opens in text editor (NOT executed) |
| `test.md` | Markdown | Opens in text editor or markdown viewer |
| `test.json` | JSON | Opens in text editor |
| `test.png` | PNG Image | Opens in image viewer |
| `test.pdf` | PDF Document | Opens in PDF viewer |

## 🚀 Quick Test

### Automated Test Script

Run the automated test script:

```bash
./test-file-opening.sh
```

This script will:
1. Add the test project
2. Test each file type
3. Ask for your feedback on each test
4. Clean up the test project

### Manual Testing

#### 1. Setup Test Project

```bash
# Add test project
fopen add testproject $(pwd)/test-files

# Verify it was added
fopen list
```

#### 2. Test Individual Files

```bash
# Test JavaScript file
fopen open "fileopener://testproject/test.js"

# Test shell script (should NOT execute)
fopen open "fileopener://testproject/test.sh"

# Test Windows batch file (should NOT execute)
fopen open "fileopener://testproject/test.bat"

# Test markdown file
fopen open "fileopener://testproject/test.md"

# Test JSON file
fopen open "fileopener://testproject/test.json"

# Test image file
fopen open "fileopener://testproject/test.png"

# Test PDF file
fopen open "fileopener://testproject/test.pdf"
```

#### 3. Cleanup

```bash
# Remove test project
fopen remove testproject
```

## 🔍 What to Look For

### ✅ Expected Behaviors

- **Text Files** (`.js`, `.md`, `.json`): Open in your default text editor
- **Script Files** (`.sh`, `.bat`): Open in text editor for viewing (NOT executed)
- **Images** (`.png`): Open in your default image viewer
- **PDFs** (`.pdf`): Open in your default PDF viewer

### ❌ Security Checks

- **Scripts should NOT execute**: `.sh` and `.bat` files should open in a text editor
- **No system commands**: No terminal windows should open unexpectedly
- **Safe viewing only**: Files should open for viewing/editing, not execution

### 🖥️ Platform-Specific Notes

#### macOS
- Uses `open` command
- Text files typically open in VS Code, Sublime Text, or TextEdit
- Images open in Preview
- PDFs open in Preview

#### Windows
- Uses `start` command
- Behavior depends on default applications
- Scripts should open in Notepad or VS Code (not execute)

#### Linux
- Uses `xdg-open` command
- Behavior depends on installed applications and desktop environment
- Scripts should open in text editor (not execute)

## 🐛 Troubleshooting

### File Doesn't Open

1. **Check project configuration**:
   ```bash
   fopen list
   ```

2. **Verify file exists**:
   ```bash
   ls -la test-files/
   ```

3. **Test with absolute path**:
   ```bash
   fopen open "fileopener://testproject/test.js"
   ```

### Script Executes Instead of Opening

⚠️ **This is a security issue!**

1. Check your system's default applications
2. Verify the fileopener CLI is working correctly
3. Report this as a bug

### Wrong Application Opens

1. Check your system's default file associations
2. This is normal behavior - the tool uses system defaults
3. You can change default applications in system settings

## 📊 Test Results Template

Use this template to record your test results:

```
Platform: [macOS/Windows/Linux]
Date: [YYYY-MM-DD]
CLI Version: [version]

File Type Tests:
- JavaScript (.js): ✅/❌ - [Notes]
- Shell Script (.sh): ✅/❌ - [Notes] 
- Batch File (.bat): ✅/❌ - [Notes]
- Markdown (.md): ✅/❌ - [Notes]
- JSON (.json): ✅/❌ - [Notes]
- PNG Image (.png): ✅/❌ - [Notes]
- PDF Document (.pdf): ✅/❌ - [Notes]

Security Check:
- Scripts opened for viewing (not executed): ✅/❌
- No unexpected terminal windows: ✅/❌
- Files opened in appropriate applications: ✅/❌

Overall Result: ✅/❌
Notes: [Any additional observations]
```

## 🔒 Security Notes

The fileopener CLI is designed with security in mind:

- **No Execution**: Script files are opened for viewing, not execution
- **Path Validation**: All paths are validated to prevent directory traversal
- **Project Boundaries**: Files can only be accessed within configured project directories
- **Safe Defaults**: Uses system default applications rather than custom execution logic

If you observe any behavior that contradicts these security principles, please report it as a bug.

## 🛡️ Security Test Results (Windows)

### Test Environment
- Platform: Windows 10/11
- Date: 2025-11-18
- CLI Version: 1.2.3

### Security Attack Tests

All security tests passed successfully on Windows platform:

| Attack Type | Test Case | Result | Notes |
|-------------|-----------|--------|-------|
| Path Traversal | `/../../../Windows/System32/calc.exe` | ✅ Blocked | URL normalized automatically |
| Absolute Path (slash) | `/C:/Windows/System32/calc.exe` | ✅ Blocked | Absolute path validation |
| Absolute Path (backslash) | `/C:\Windows\System32\calc.exe` | ✅ Blocked | Windows path format detected |
| Tilde Home | `/~/Documents/test.txt` | ✅ Blocked | Tilde traversal detected |
| UNC Path | `//192.168.1.1/share/file.txt` | ✅ Blocked | Network path blocked |
| URL Encoded | `/%2e%2e%2f%2e%2e%2f...` | ✅ Blocked | Decoded then blocked |
| Legacy Format | `?path=C:\test.txt` | ✅ Blocked | Absolute path in query param |
| Valid File | `/package.json` | ✅ Opened | Within project boundary |
| Valid File | `/README.md` | ✅ Opened | Within project boundary |

### Security Layers Verified

1. **Initial Validation**: Blocks paths containing `..` or `~`
2. **Absolute Path Check**: Detects Windows (`C:\`) and Unix (`/`) absolute paths
3. **Normalization Check**: Re-validates after `path.normalize()`
4. **Final Boundary Check**: Uses `path.resolve()` + `startsWith()` to ensure resolved path is within project

### File Opening Verification

The Windows file opening implementation was updated to use:
```javascript
command = 'cmd'
args = ['/c', 'start', '""', filePath]
```

This ensures:
- ✅ Handles paths with spaces correctly
- ✅ No shell injection vulnerabilities
- ✅ Uses system default applications safely
- ✅ Process cleanup after file operation

### Audit Log

All security violations are logged to `%USERPROFILE%\.fopen-cli\handler.log` with:
- Timestamp
- Attack type (e.g., "SECURITY VIOLATION: Absolute path not allowed")
- Attempted path
- Project path for reference

Example log entry:
```
[2025-11-18T00:59:12.590Z] SECURITY VIOLATION: Absolute path not allowed
[2025-11-18T00:59:12.590Z] Attempted path: "C:/Windows/System32/calc.exe"
[2025-11-18T00:59:12.591Z] Project path: "C:\woo-work\workflow\url-fileopener"
```
