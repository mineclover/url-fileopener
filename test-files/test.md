# Test Markdown File

This is a test markdown file for the fileopener CLI tool.

## Features to Test

- [x] JavaScript files (.js)
- [x] Shell scripts (.sh) 
- [x] Markdown files (.md)
- [ ] Text files (.txt)
- [ ] JSON files (.json)

## Expected Behavior

When you click on a `fileopener://` URL, the file should:

1. **Open in your default text editor** (VS Code, Sublime Text, etc.)
2. **NOT execute** if it's a script file
3. **Display the content** for viewing/editing

## Security Note

Script files like `.sh`, `.bat`, `.exe` should open in a text editor for viewing, not execute. This is the safe and expected behavior.

## Test Results

- **Platform**: macOS/Windows/Linux
- **Default Editor**: [Your editor here]
- **File Opened**: ✅/❌
- **Executed**: ❌ (should never happen)
- **Notes**: [Any observations]

---

*This file was created for testing the fileopener CLI tool.*
