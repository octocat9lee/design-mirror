"""
Style Extractor: Screenshot Optimizer

Compresses and resizes screenshots to ensure they can be read by Claude Code.

Usage:
  python scripts/screenshot-optimizer.py <input> [--out output.jpg] [--max-width 1920] [--quality 85] [--max-size 2MB]

Options:
  --out         Output file path (default: input_optimized.jpg)
  --max-width   Maximum width in pixels (default: 1920)
  --quality     JPEG quality 1-100 (default: 85)
  --max-size    Maximum file size with unit (default: 2MB)

Examples:
  python scripts/screenshot-optimizer.py screenshot.png
  python scripts/screenshot-optimizer.py screenshot.png --out small.jpg --max-width 1280 --quality 80
  python scripts/screenshot-optimizer.py screenshot.png --max-size 1MB

Notes:
  - Automatically converts PNG to JPEG for better compression
  - Iteratively reduces quality/size until target file size is reached
  - Preserves aspect ratio when resizing
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow is required. Install with: pip install Pillow")
    sys.exit(1)


def parse_size(size_str: str) -> int:
    """Parse size string like '2MB' or '500KB' to bytes."""
    size_str = size_str.strip().upper()
    match = re.match(r'^(\d+(?:\.\d+)?)\s*(KB|MB|GB|B)?$', size_str)
    if not match:
        raise ValueError(f"Invalid size format: {size_str}")

    value = float(match.group(1))
    unit = match.group(2) or 'B'

    multipliers = {
        'B': 1,
        'KB': 1024,
        'MB': 1024 * 1024,
        'GB': 1024 * 1024 * 1024
    }

    return int(value * multipliers[unit])


def get_file_size(path: Path) -> int:
    """Get file size in bytes."""
    return path.stat().st_size


def format_size(size_bytes: int) -> str:
    """Format bytes to human-readable string."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024:
            return f"{size_bytes:.1f}{unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f}TB"


def optimize_screenshot(
    input_path: Path,
    output_path: Path,
    max_width: int = 1920,
    quality: int = 85,
    max_size_bytes: int = 2 * 1024 * 1024
) -> dict:
    """
    Optimize a screenshot by resizing and compressing.

    Returns a dict with optimization results.
    """
    result = {
        'input': str(input_path),
        'output': str(output_path),
        'input_size': 0,
        'output_size': 0,
        'input_dimensions': (0, 0),
        'output_dimensions': (0, 0),
        'quality_used': quality,
        'success': False,
        'message': ''
    }

    # Load image
    try:
        img = Image.open(input_path)
    except Exception as e:
        result['message'] = f"Failed to open image: {e}"
        return result

    result['input_size'] = get_file_size(input_path)
    result['input_dimensions'] = img.size

    # Convert to RGB if necessary (for JPEG output)
    if img.mode in ('RGBA', 'P', 'LA'):
        # Create white background for transparency
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    # Resize if too wide
    if img.width > max_width:
        ratio = max_width / img.width
        new_size = (max_width, int(img.height * ratio))
        img = img.resize(new_size, Image.LANCZOS)
        print(f"Resized: {result['input_dimensions']} -> {new_size}")

    # Iteratively compress until target size is reached
    current_quality = quality
    current_img = img
    temp_path = output_path.with_suffix('.tmp.jpg')

    while current_quality >= 20:
        # Save with current quality
        current_img.save(temp_path, format='JPEG', quality=current_quality, optimize=True)
        current_size = get_file_size(temp_path)

        if current_size <= max_size_bytes:
            # Success - move temp to output
            temp_path.rename(output_path)
            result['output_size'] = current_size
            result['output_dimensions'] = current_img.size
            result['quality_used'] = current_quality
            result['success'] = True
            result['message'] = f"Optimized successfully: {format_size(result['input_size'])} -> {format_size(current_size)}"
            return result

        # Need further reduction
        if current_quality > 50:
            # Reduce quality first
            current_quality -= 10
            print(f"Reducing quality to {current_quality}...")
        else:
            # Quality is already low, reduce dimensions
            new_width = int(current_img.width * 0.8)
            if new_width < 400:
                break  # Don't go too small
            new_height = int(current_img.height * 0.8)
            current_img = current_img.resize((new_width, new_height), Image.LANCZOS)
            print(f"Reducing dimensions to {new_width}x{new_height}...")

    # Cleanup temp file if it exists
    if temp_path.exists():
        temp_path.unlink()

    # Last resort - save with minimum quality
    current_img.save(output_path, format='JPEG', quality=20, optimize=True)
    result['output_size'] = get_file_size(output_path)
    result['output_dimensions'] = current_img.size
    result['quality_used'] = 20
    result['success'] = True
    result['message'] = f"Optimized with aggressive compression: {format_size(result['input_size'])} -> {format_size(result['output_size'])}"

    return result


def main() -> int:
    parser = argparse.ArgumentParser(
        description='Optimize screenshots for Claude Code compatibility'
    )
    parser.add_argument('input', help='Input image file')
    parser.add_argument('--out', default='', help='Output file path')
    parser.add_argument('--max-width', type=int, default=1920, help='Maximum width (default: 1920)')
    parser.add_argument('--quality', type=int, default=85, help='JPEG quality 1-100 (default: 85)')
    parser.add_argument('--max-size', default='2MB', help='Maximum file size (default: 2MB)')

    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: Input file not found: {input_path}")
        return 1

    # Determine output path
    if args.out:
        output_path = Path(args.out)
    else:
        stem = input_path.stem
        output_path = input_path.parent / f"{stem}_optimized.jpg"

    # Parse max size
    try:
        max_size_bytes = parse_size(args.max_size)
    except ValueError as e:
        print(f"Error: {e}")
        return 1

    print(f"Input: {input_path}")
    print(f"Output: {output_path}")
    print(f"Max width: {args.max_width}px")
    print(f"Quality: {args.quality}")
    print(f"Max size: {args.max_size}")
    print()

    result = optimize_screenshot(
        input_path=input_path,
        output_path=output_path,
        max_width=args.max_width,
        quality=args.quality,
        max_size_bytes=max_size_bytes
    )

    if result['success']:
        print(f"✓ {result['message']}")
        print(f"  Dimensions: {result['input_dimensions']} -> {result['output_dimensions']}")
        print(f"  Quality: {result['quality_used']}")
        reduction = (1 - result['output_size'] / result['input_size']) * 100
        print(f"  Reduction: {reduction:.1f}%")
        return 0
    else:
        print(f"✗ {result['message']}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
