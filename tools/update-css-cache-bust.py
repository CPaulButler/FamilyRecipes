#!/usr/bin/env python3
"""
Update cache-busting query params for local CSS references in HTML files.
"""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse
import re
import sys


def is_local_url(url: str) -> bool:
    lowered = url.lower()
    return not (
        lowered.startswith("http://")
        or lowered.startswith("https://")
        or lowered.startswith("//")
        or lowered.startswith("data:")
    )


def update_css_href(url: str, cache_value: str) -> str:
    parsed = urlparse(url)
    if not parsed.path.lower().endswith(".css"):
        return url

    query_items = [(k, v) for k, v in parse_qsl(parsed.query, keep_blank_values=True) if k != "v"]
    query_items.append(("v", cache_value))
    new_query = urlencode(query_items)
    return urlunparse(parsed._replace(query=new_query))


def update_html_content(content: str, cache_value: str) -> str:
    href_pattern = re.compile(r"href=(['\"])([^'\"]+)\1", re.IGNORECASE)

    def replace_href(match: re.Match[str]) -> str:
        quote = match.group(1)
        url = match.group(2)
        if not is_local_url(url):
            return match.group(0)
        updated_url = update_css_href(url, cache_value)
        if updated_url == url:
            return match.group(0)
        return f"href={quote}{updated_url}{quote}"

    return href_pattern.sub(replace_href, content)


def main() -> int:
    repo_root = Path(__file__).resolve().parents[1]
    cache_value = datetime.utcnow().strftime("%Y%m%d%H%M%S")

    html_files = [
        path
        for path in repo_root.rglob("*.html")
        if ".git" not in path.parts
    ]

    updated_files = []
    for html_file in html_files:
        original = html_file.read_text(encoding="utf-8")
        updated = update_html_content(original, cache_value)
        if updated != original:
            html_file.write_text(updated, encoding="utf-8", newline="\n")
            updated_files.append(html_file)

    if updated_files:
        print("Updated cache-busting params in:")
        for path in updated_files:
            print(f"- {path.relative_to(repo_root)}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
