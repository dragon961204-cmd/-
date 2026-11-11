#!/usr/bin/env python3
"""Capture *published* LOTM character pages (the bold entries), not every indexed alias.

Usage: python scripts/import_lotm_278.py
Needs: pip install beautifulsoup4 requests
Output: lore/characters/lotmfanwiki_published_278.json, only when count is EXACTLY 278.
Never fabricate missing records on extraction failure.
"""
import json
import re
from pathlib import Path
import requests
from bs4 import BeautifulSoup

SOURCE = "https://lotmfanwiki.com/type/p.html"
DEST = Path("lore/characters/lotmfanwiki_published_278.json")
session = requests.Session()
session.headers.update({"User-Agent": "LOTM-world-database-research/1.0 (character metadata only)"})
response = session.get(SOURCE, timeout=35)
response.raise_for_status()
soup = BeautifulSoup(response.text, "html.parser")
table = next((t for t in soup.select("table") if "名称" in t.get_text(" ", strip=True) and "章节" in t.get_text(" ", strip=True)), None)
if table is None:
    raise SystemExit("Cannot locate 人物 index table. No file written.")
entries = []
diagnostics = []
for row in table.select("tr"):
    cols = row.find_all(["td"], recursive=False)
    if len(cols) < 1:
        continue
    cell = cols[0]
    name_tag = cell.find(["a", "strong", "b"])
    if not name_tag:
        continue
    label = name_tag.get_text(" ", strip=True)
    if not label:
        continue
    # Publication signal is bold in the NAME column, not high chapter/fact counts.
    is_bold = bool(cell.find(["strong", "b"]))
    link = cell.find("a", href=True)
    # Alternate styling used by certain static-site templates.
    publish_style = any("font-weight" in x.get("style", "").lower() and (
        "bold" in x.get("style", "").lower() or "700" in x.get("style", "")) for x in [cell, *cell.find_all(True)])
    if not (is_bold or publish_style):
        continue
    url = requests.compat.urljoin(SOURCE, link["href"]) if link else None
    if not url:
        diagnostics.append({"title": label, "error": "published-but-no-link"})
        continue
    chapter = cols[1].get_text(" ", strip=True) if len(cols) > 1 else None
    facts = cols[2].get_text(" ", strip=True) if len(cols) > 2 else None
    first = cols[3].get_text(" ", strip=True) if len(cols) > 3 else None
    entries.append({"source_title": label, "page_url": url,
                    "chapters_count": chapter, "facts_count": facts,
                    "first_appearance_label": first,
                    "identity_link_status": "not_reconciled",
                    "user_review_status": "pending"})
unique = {x["page_url"]: x for x in entries}
published = list(unique.values())
print(json.dumps({"source": SOURCE, "html_bytes": len(response.content),
    "all_table_rows": len(table.select("tr")) - 1,
    "matched_published_rows": len(entries),
    "unique_published_urls": len(published),
    "diagnostics": diagnostics[:15]}, ensure_ascii=False, indent=2))
if len(published) != 278 or diagnostics:
    raise SystemExit("Expected 278 unique published pages with valid URLs. Site markup needs inspection; refusing to write an unverified catalog.")
DEST.parent.mkdir(parents=True, exist_ok=True)
DEST.write_text(json.dumps({
    "schema_version": "1.0",
    "source": SOURCE,
    "source_reported_pages": 278,
    "source_reported_index_rows": 1368,
    "actual_extracted_pages": len(published),
    "method": "published bold table-name entry with linked detail page",
    "identity_note": "One wiki page may correspond to multiple literary identities, or multiple aliases may be merged. Do not convert source pages to character IDs without explicit review.",
    "entries": published
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Wrote", DEST)
