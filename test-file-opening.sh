#!/bin/bash

# Test script for fileopener CLI file opening behavior
# This script tests various file types to see how they open

echo "🧪 Testing fileopener CLI file opening behavior"
echo "=============================================="

# Check if fopen is installed
if ! command -v fopen &> /dev/null; then
    echo "❌ fopen command not found. Please install the CLI first:"
    echo "   npm install -g @context-action/fopen-cli"
    echo "   fopen install"
    exit 1
fi

# Add test project
echo "📁 Adding test project..."
fopen add testproject $(pwd)/test-files

echo ""
echo "🔍 Testing different file types..."
echo ""

# Test cases
declare -a test_files=(
    "test.js:JavaScript file"
    "test.sh:Shell script"
    "test.bat:Windows batch file"
    "test.md:Markdown file"
    "test.json:JSON file"
    "test.jpg:JPG image"
    "test.pdf:PDF document"
)

for test_case in "${test_files[@]}"; do
    IFS=':' read -r filename description <<< "$test_case"
    file_path="test-files/$filename"
    
    if [ -f "$file_path" ]; then
        echo "📄 Testing: $description ($filename)"
        echo "   Command: fopen open \"fileopener://testproject/$filename\""
        echo "   Expected: Opens in default application for viewing"
        echo "   ⚠️  Watch your screen - the file should open now!"
        echo ""
        
        # Open the file
        echo "   🚀 Opening file..."
        open "fileopener://testproject/$filename"
        echo "   ✅ $filename opened (check your screen)"
        echo ""
    else
        echo "❌ Test file not found: $file_path"
    fi
done

echo "🧹 Cleaning up..."
fopen remove testproject

echo ""
echo "📊 Test Summary:"
echo "================"
echo "This test checked how different file types open with the fileopener CLI."
echo ""
echo "Expected behaviors:"
echo "• Text files (.js, .md, .json) → Open in text editor"
echo "• Script files (.sh, .bat) → Open in text editor (NOT executed)"
echo "• Images (.png) → Open in image viewer"
echo "• PDFs (.pdf) → Open in PDF viewer"
echo ""
echo "Security note: Executable files should open for viewing, not execution!"
echo ""
echo "✅ Test completed!"
