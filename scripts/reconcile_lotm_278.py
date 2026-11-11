#!/usr/bin/env python3
"""Reconcile source PAGE ids against existing CHARACTER ids, conservatively.

Pages are not guaranteed to be distinct in-universe individuals. This script
never adds new character IDs, never treats draft profiles as user-approved and
never overwrites user-reviewed mapping.
Requires: pip install opencc-python-reimplemented
"""
import json, re, unicodedata
from pathlib import Path
from opencc import OpenCC

CATALOG=Path("lore/characters/lotmfanwiki_published_278.json")
INDEX=Path("lore/characters/index_v0.1.json")
OUT=Path("lore/characters/278_page_reconciliation_v0.1.json")
trans=OpenCC("s2t")
def norm(s):
    s=trans.convert(unicodedata.normalize("NFKC",s or "")).lower()
    return re.sub(r"[\s·‧.。·,，、!！?？（）()“”‘’\[\]「」《》]+","",s)

source=json.loads(CATALOG.read_text(encoding="utf-8"))
index=json.loads(INDEX.read_text(encoding="utf-8"))
people=index["characters"]
assert len(source["entries"])==278,"Source catalog must have 278 published pages"
manual={
    "“魔術師”女士":"fors-wall",
    "羅塞爾大帝":"roselle-gustav",
    "克萊恩":"klein-moretti",
    "盧米安":"lumian-lee",
    "奧黛麗":"audrey-hall",
    "芙蘭卡":"franca-roland",
    "簡娜":"jenna",
    "阿爾傑":"alger-wilson",
    "戴里克":"derrick-berg",
    "倫納德":"leonard-mitchell",
    "梅麗莎":"melissa-moretti",
    "安東尼":"anthony-reid",
    "蕾妮特緹尼科爾":"reinette-tinekerr",
    "弗蘭克李":"frank-lee",
    "帕列斯索羅亞斯德":"pallez-zoroast",
    "威爾昂賽汀":"will-auceptin",
    "鄧恩史密斯":"dunn-smith",
}
canonical={}
for p in people:
    names=[p.get("name_zh") or "",p.get("name_en") or ""]
    names += [(x if isinstance(x,str) else x.get("name","")) for x in p.get("aliases",[])]
    for n in names:
        k=norm(n)
        if k: canonical.setdefault(k,set()).add(p["id"])
allids={p["id"] for p in people}
assert all(v in allids for v in manual.values()),"Manual alias mapping points to nonexistent ID"

rows=[]
for pos,e in enumerate(source["entries"],1):
    key=norm(e["source_title"])
    direct=sorted(canonical.get(key,set()))
    manual_id=manual.get(key)
    if manual_id:
        status="manual_alias_candidate" if manual_id not in direct else "exact_name_candidate"
        suggestions=[manual_id]
    elif len(direct)==1:
        status="exact_name_candidate"
        suggestions=direct
    elif len(direct)>1:
        status="ambiguous"
        suggestions=direct
    else:
        # Partial Chinese names are only suggestions, never auto-identity.
        partial=sorted({cid for name,ids in canonical.items() for cid in ids
            if len(key)>=3 and len(name)>=3 and (key in name or name in key)})
        status="partial_name_candidate" if len(partial)==1 else ("ambiguous" if partial else "unmatched")
        suggestions=partial
    rows.append({
        "source_page_number":pos,"source_title":e["source_title"],
        "source_url":e["page_url"],"first_appearance_label":e.get("first_appearance_label"),
        "source_chapters_count":e.get("chapters_count"),
        "source_facts_count":e.get("facts_count"),
        "match_status":status,"candidate_character_ids":suggestions,
        "confirmed_character_id":None,"user_review_status":"pending",
        "review_notes":"同名或相似名只是候選比對，未經使用者審核；百科頁面與角色實體不一定一對一。"
    })
counts={s:sum(x["match_status"]==s for x in rows) for s in
    ("exact_name_candidate","manual_alias_candidate","partial_name_candidate","ambiguous","unmatched")}
out={
 "schema_version":"0.1","source_pages":len(rows),"existing_character_index":len(people),
 "purpose":"278 verified source-page URLs vs named character IDs; suggestion-only, pending human review",
 "counts":counts,
 "identity_confirmation_count":0,
 "entries":rows
}
OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({"output":str(OUT),"source_pages":len(rows),"people":len(people),"counts":counts},ensure_ascii=False))
