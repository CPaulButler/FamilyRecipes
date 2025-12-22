#!/usr/bin/env python3
"""
Download and convert Grandma Mary's photo from GitHub issue to WebP format.

This script downloads the image attached to the GitHub issue and converts it to WebP format.
Run this script if you have access to download GitHub user-attachments.
"""

import requests
import sys
from PIL import Image
from pathlib import Path

def download_and_convert():
    # The image URL from the GitHub issue
    image_url = "https://github.com/user-attachments/assets/7eea5f77-f108-46b0-ab97-6deba7a66301"
    
    # Output paths
    temp_file = Path("/tmp/grandma-mary-temp.jpg")
    output_file = Path(__file__).parent.parent / "images" / "photos" / "grandma-mary.webp"
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"Downloading image from: {image_url}")
    
    try:
        # Download the image
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(image_url, headers=headers, timeout=30, allow_redirects=True)
        response.raise_for_status()
        
        if len(response.content) < 1000:
            print("Error: Downloaded file is too small, likely not an image")
            return False
        
        # Save temporarily
        temp_file.write_bytes(response.content)
        print(f"✓ Downloaded {len(response.content):,} bytes")
        
        # Convert to WebP
        print(f"Converting to WebP format...")
        img = Image.open(temp_file)
        img.save(output_file, 'WEBP', quality=85)
        print(f"✓ Successfully created {output_file}")
        print(f"  Output file size: {output_file.stat().st_size:,} bytes")
        
        # Clean up temp file
        temp_file.unlink()
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"✗ Network error: {e}")
        print("\nNote: If you're in a restricted network environment, you may need to:")
        print("1. Download the image manually from the GitHub issue")
        print("2. Save it as /tmp/grandma-mary-downloaded.jpg")
        print("3. Run: python3 -c 'from PIL import Image; Image.open(\"/tmp/grandma-mary-downloaded.jpg\").save(\"images/photos/grandma-mary.webp\", \"WEBP\", quality=85)'")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

if __name__ == "__main__":
    success = download_and_convert()
    sys.exit(0 if success else 1)
