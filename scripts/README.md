# Converting Grandma Mary's Photo to WebP

This document explains how to download and convert Grandma Mary's photo from the GitHub issue to WebP format.

## Issue

The photo is attached to GitHub issue #14: "Add real photos"  
Image URL: https://github.com/user-attachments/assets/7eea5f77-f108-46b0-ab97-6deba7a66301

## Automated Method

If you have network access to GitHub's S3 assets, run:

```bash
python3 scripts/download-grandma-photo.py
```

This script will:
1. Download the image from the GitHub issue
2. Convert it to WebP format with 85% quality
3. Save it as `images/photos/grandma-mary.webp`

## Manual Method

If the automated script fails due to network restrictions:

### Step 1: Download the Image

Visit the GitHub issue and download the attached photo, or use:

```bash
curl -L "https://github.com/user-attachments/assets/7eea5f77-f108-46b0-ab97-6deba7a66301" -o /tmp/grandma-mary.jpg
```

### Step 2: Convert to WebP

Using the provided bash script:

```bash
./scripts/convert-image-to-webp.sh /tmp/grandma-mary.jpg grandma-mary
```

Or using Python/PIL directly:

```bash
python3 -c "from PIL import Image; Image.open('/tmp/grandma-mary.jpg').save('images/photos/grandma-mary.webp', 'WEBP', quality=85)"
```

Or using cwebp command:

```bash
cwebp -q 85 /tmp/grandma-mary.jpg -o images/photos/grandma-mary.webp
```

## Verification

After conversion, verify the file was created:

```bash
ls -lh images/photos/grandma-mary.webp
file images/photos/grandma-mary.webp
```

## Code Changes

The file `person-details.js` has been updated to reference `grandma-mary.webp` instead of `grandma-mary.svg`.

## Requirements

- **Python method**: Requires `Pillow` library (`pip install Pillow`)
- **Bash method**: Requires `cwebp` tool (`apt-get install webp` or `brew install webp`)
