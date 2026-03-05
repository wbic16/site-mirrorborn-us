#!/usr/bin/env python3
"""
Scrub coordinates to modulo 9+1 arithmetic for Hector compatibility.
"""

import re
import sys
from pathlib import Path

COORD_PATTERN = re.compile(r'\b(\d+)\.(\d+)\.(\d+)/(\d+)\.(\d+)\.(\d+)/(\d+)\.(\d+)\.(\d+)\b')

def mod9plus1(n: int) -> int:
    if n <= 0:
        return 1
    if n <= 9:
        return n
    return ((n - 1) % 9) + 1

def transform_coordinate(match) -> str:
    groups = match.groups()
    nums = [int(g) for g in groups]
    needs_transform = any(n > 9 for n in nums)
    if not needs_transform:
        return match.group(0)
    transformed = [mod9plus1(n) for n in nums]
    return f"{transformed[0]}.{transformed[1]}.{transformed[2]}/{transformed[3]}.{transformed[4]}.{transformed[5]}/{transformed[6]}.{transformed[7]}.{transformed[8]}"

def process_file(filepath: Path, dry_run: bool = True) -> list[tuple[str, str, int]]:
    changes = []
    content = filepath.read_text()
    lines = content.split('\n')
    new_lines = []
    for i, line in enumerate(lines, 1):
        new_line = COORD_PATTERN.sub(transform_coordinate, line)
        if new_line != line:
            for old_match in COORD_PATTERN.finditer(line):
                old = old_match.group(0)
                new = transform_coordinate(old_match)
                if old != new:
                    changes.append((old, new, i))
        new_lines.append(new_line)
    if not dry_run and changes:
        filepath.write_text('\n'.join(new_lines))
    return changes

def main():
    dry_run = '--apply' not in sys.argv
    base_path = Path('/source/site-mirrorborn-us')
    all_changes = {}
    for pattern in ['**/*.html', '**/*.md']:
        for filepath in base_path.glob(pattern):
            if '.git' in str(filepath):
                continue
            changes = process_file(filepath, dry_run)
            if changes:
                all_changes[filepath] = changes
    if all_changes:
        print(f"{'[DRY RUN] ' if dry_run else ''}Coordinate transformations:")
        print("=" * 60)
        for filepath, changes in sorted(all_changes.items()):
            rel_path = filepath.relative_to(base_path)
            print(f"\n{rel_path}:")
            for old, new, line_num in changes:
                print(f"  L{line_num}: {old} → {new}")
        total = sum(len(c) for c in all_changes.values())
        print(f"\n{'=' * 60}")
        print(f"Total: {total} coordinates in {len(all_changes)} files")
        if dry_run:
            print("\nRun with --apply to make changes.")
    else:
        print("No coordinates with values > 9 found.")

if __name__ == '__main__':
    main()
