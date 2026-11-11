#!/usr/bin/env python3
"""Bulk-enrich the *278 verified source pages* with conservative metadata.

Does not copy the site narrative nor pretend the metadata is a verified biography.
Creates one source dossier for each published page, with headings, basic attributes,
chapter references, original link, and user-review flags.

Usage: python scripts/enrich_lotm_source_pages.py
Deps: requests beautifulsoup4 opencc-python-reimplemented
"""
from __future__ import annotations
import concurrent.futures
import json
import re
import sys
import urllib.parse
from pathlib import Path
import requests
from bs4 import BeautifulSoup
from opencc import OpenCC

ROOT = Path("lore/characters")
catalog = json.loads((ROOT / "lotmfanwiki_published_278.json").read_text(encoding="utf-8"))
reconciliation = json.loads((ROOT / "278_page_reconciliation_v0.1.json").read_text(encoding="utf-8"))
entries = catalog["entries"]
assert len(entries) == 278
cc = OpenCC("s2t")
BY_URL = {x["source_url"]: x for x in reconciliation["entries"]}
HEADERS = {"User-Agent": "LOTM-lore-research-metadata/1.0"}
OUT = ROOT / "source_page_dossiers_v0.1.json"
bad=[]

def fetch(entry):
    url=entry["page_url"]
    try:
        r=requests.get(url,timeout=25,headers=HEADERS)
        r.raise_for_status()
        r.encoding="utf-8"
        soup=BeautifulSoup(r.text,"html.parser")
        main=soup.select_one("main") or soup
        h1=main.find("h1")
        headings=[]
        for x in main.select("h2,h3"):
            name=cc.convert(x.get_text(" ",strip=True))
            if name and name not in headings: headings.append(name[:120])
        # Capture only short key names as navigational headings, not narrative paragraphs.
        structured={}
        for tr in main.select("tr"):
            tds=tr.find_all(["th","td"],recursive=False)
            if len(tds)==2:
                k=cc.convert(tds[0].get_text(" ",strip=True)).strip()
                v=cc.convert(tds[1].get_text(" ",strip=True)).strip()
                if 0<len(k)<=30 and 0<len(v)<=150 and k not in structured and len(structured)<18:
                    structured[k]=v
        links=[]
        for a in main.select("a[href]"):
            href=urllib.parse.urljoin(url,a["href"])
            if "/chapter/" not in href: continue
            label=cc.convert(a.get_text(" ",strip=True))
            if href not in [z["url"] for z in links]:
                links.append({"label":label[:55],"url":href})
            if len(links)>=12: break
        return {"source_title":entry["source_title"],"source_title_traditional":cc.convert(entry["source_title"]),
                "source_url":url,"source_id":re.search(r"(cn-p-[a-f0-9]+)",url).group(1),
                "index_chapters_count":entry.get("chapters_count"),
                "index_facts_count":entry.get("facts_count"),
                "index_first_appearance":entry.get("first_appearance_label"),
                "html_title_traditional":cc.convert(h1.get_text(" ",strip=True)) if h1 else None,
                "section_headings":headings[:32],"compact_infobox_fields":structured,
                "chapter_link_samples":links,
                "original_index_match_status":BY_URL.get(url,{}).get("match_status","unknown"),
                "candidate_character_ids":BY_URL.get(url,{}).get("candidate_character_ids",[]),
                "review_status":"pending_user_review",
                "content_level":"source_navigation_metadata_not_narrative_biography"}
    except Exception as err:
        return {"source_title":entry["source_title"],"source_url":url,
                "error":str(err),"review_status":"fetch_failed"}

with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
    records=list(pool.map(fetch,entries))
problems=[x for x in records if x.get("error")]
print(json.dumps({"retrieved":len(records)-len(problems),"total":len(records),
    "failed":len(problems),"sample_errors":problems[:3],
    "first_section_headings":records[0].get("section_headings",[]),
    "first_infobox":records[0].get("compact_infobox_fields",{})},ensure_ascii=False,indent=2))
if problems:
    raise SystemExit("Refusing to write incomplete metadata: "+str(len(problems))+" failed pages.")
result={"schema_version":"0.1","source":"https://lotmfanwiki.com/type/p.html",
    "source_pages_total":278,"records_with_metadata":len(records),
    "copyright_policy":"Headings, short factual attributes, link indices only; no wholesale site prose or novel text stored.",
    "entries":records}
OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Saved",OUT)
