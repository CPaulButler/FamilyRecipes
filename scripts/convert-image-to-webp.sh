#!/bin/bash
# Script to convert Grandma Mary's photo to WebP format
# Usage: ./scripts/convert-image-to-webp.sh <input-image> <output-name>
# Example: ./scripts/convert-image-to-webp.sh grandma-mary.jpg grandma-mary

set -e

if [ $# -lt 2 ]; then
    echo "Usage: $0 <input-image> <output-name>"
    echo "Example: $0 ~/Downloads/grandma-mary.jpg grandma-mary"
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_NAME="$2"
OUTPUT_DIR="$(dirname "$0")/../images/photos"
OUTPUT_FILE="$OUTPUT_DIR/${OUTPUT_NAME}.webp"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file '$INPUT_FILE' not found"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "Error: cwebp is not installed"
    echo "Install it with: sudo apt-get install webp (Debian/Ubuntu)"
    echo "Or: brew install webp (macOS)"
    exit 1
fi

# Convert to WebP with good quality
echo "Converting $INPUT_FILE to WebP format..."
cwebp -q 85 "$INPUT_FILE" -o "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Successfully created $OUTPUT_FILE"
    ls -lh "$OUTPUT_FILE"
else
    echo "✗ Error: Failed to convert image"
    exit 1
fi
