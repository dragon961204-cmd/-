#!/usr/bin/env python3
"""Attach source-linked life-stage chronologies to existing individual biographies.

Runs locally on the checked-out repo, avoids replacing existing historical_sections.
No biography is declared complete just because wiki chapter outlines exist.
"""
import json
import re
from pathlib import Path
root=Path("lore/characters")
manifest=json.loads((root/"source_page_records_manifest_v1.json").read_text(encoding="utf-8"))
groups={}
for entry in manifest["entries"]:
    if len(entry.get("candidate_character_ids",[]))!=1:
        continue
    groups.setdefault(entry["candidate_character_ids"][0],[]).append(entry)
changed=0; total_stages=0;missing=[]
for cid,entries in groups.items():
    path=root/"biographies"/(cid+".v1.json")
    if not path.exists():
        missing.append(cid)
        continue
    bio=json.loads(path.read_text(encoding="utf-8"))
    stages=[]; pages=[]
    for e in entries:
        s=json.loads(Path(e["record"]).read_text(encoding="utf-8"))
        pages.append({"id":s["source_page_id"],"title":s["source_title_traditional"],"url":s["original_url"]})
        for raw in s["biography_stage_outline"]:
            title=raw["heading"]
            if re.match(r"^(能力與序列|關係圖|相關物品|外貌與形象描寫|分卷索引|作者補充|作者設定集|編輯綜述|拾遺|相關條目|夢境都市$|角色介紹|相關組織)",title):
                continue
            if title in ("《詭祕之主》","《宿命之環》"):
                continue
            stages.append({"stage_heading":title,
                           "kind":"story_period" if re.search(r"第\d+卷|第\d+[–-]\d+章|第\d+章",title) else "named_episode_or_section",
                           "source_page_id":s["source_page_id"],
                           "source_url":s["original_url"],
                           "narrative_status":"source_heading_only",
                           "review_status":"pending_user_review"})
    bio["source_chronology_outline"]={"schema_version":"1.0","source_pages":pages,
            "life_and_event_stages":stages,
            "scope":"source_guided_chronology_not_completed_prose",
            "review_status":"pending_user_review"}
    bio["biography_quality"]={**bio.get("biography_quality",{}),
            "source_chronology_attached":True,
            "independently_verified_full_biography":False,
            "source_stage_count":len(stages)}
    path.write_text(json.dumps(bio,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    changed+=1;total_stages+=len(stages)
print("Index-only source matches (no biography yet):", missing)
assert changed >= 80, "Unexpectedly few existing characters: "+str(changed)
report={"schema_version":"1.0","existing_biographies_enriched":changed,
        "life_stage_headings_attached":total_stages,
        "index_only_matches_skipped":missing, "user_approved":0,"full_biographies_completed_by_this_job":0,
        "notes":"Only navigation chronology and source links attached; detailed narrative prose needs separate authorship."}
(root/"biography_chronology_import_report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps(report,ensure_ascii=False))
