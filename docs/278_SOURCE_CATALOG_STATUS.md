# 278個獨立人物頁面：完整來源擷取與比對報告

資料來源： https://lotmfanwiki.com/type/p.html

## 已完成（2026-11-11）
- **278/278個獨立頁面**，HTML中278個加粗條目，成功由GitHub Actions擷取；每頁有不同網址。
- 原站同時含 **1368筆索引行**，其中未加粗者不算獨立人物頁面。
- 原始可查名單：`lore/characters/lotmfanwiki_published_278.json`
- 與既有118名候選ID的比對：`lore/characters/278_page_reconciliation_v0.1.json`
- 依據章節出現數排序的待辨識清單：`lore/characters/page_backlog_priority_v0.1.json`

## 初步比對（注意：均為候選匹配，不是已經使用者驗收）
| 分類 | 頁面 |
|---|---:|
| 名稱直接匹配 | 41 |
| 人工指定別名候選 | 17 |
| 部分名稱相似候選 | 10 |
| 無法自動匹配 | 210 |
| 合計 | 278 |
| 使用者已確認身份映射 | 0 |

## 優先處理的未匹配條目
| 頁面 | 章節數 | 原始連結 |
|---|---:|---|
| ／真／实／造／物／主／ | 445 | https://lotmfanwiki.com/node/cn-p-dadb6de000dc.html |
| ／黑／夜／女／神／ | 324 | https://lotmfanwiki.com/node/cn-p-34f83b503735.html |
| ／路／德／维／希／ | 299 | https://lotmfanwiki.com/node/cn-p-ac5e19d32139.html |
| ／天／尊／ | 208 | https://lotmfanwiki.com/node/cn-p-4c1eaba9437c.html |
| ／原／初／魔／女／ | 182 | https://lotmfanwiki.com/node/cn-p-36cd76a73805.html |
| ／伟／大／母／亲／ | 173 | https://lotmfanwiki.com/node/cn-p-41049987c96b.html |
| ／卢／加／诺／ | 157 | https://lotmfanwiki.com/node/cn-p-281ebb304662.html |
| ／纪／尧／姆／.／贝／内／ | 155 | https://lotmfanwiki.com/node/cn-p-a9cb839f4d9d.html |
| ／加／德／纳／.／马／丁／ | 145 | https://lotmfanwiki.com/node/cn-p-9bdb2381a54a.html |
| ／永／恒／烈／阳／ | 143 | https://lotmfanwiki.com/node/cn-p-e45f9cf34143.html |
| ／普／阿／利／斯／夫／人／ | 122 | https://lotmfanwiki.com/node/cn-p-33eb92d22a34.html |
| ／大／地／母／神／ | 119 | https://lotmfanwiki.com/node/cn-p-3f2c165b8249.html |
| ／风／暴／之／主／ | 117 | https://lotmfanwiki.com/node/cn-p-7bd9fee60e24.html |
| ／海／拉／ | 114 | https://lotmfanwiki.com/node/cn-p-77cb98c5511f.html |
| ／马／里／奇／ | 113 | https://lotmfanwiki.com/node/cn-p-0182ae9bab02.html |
| ／欲／望／母／树／ | 107 | https://lotmfanwiki.com/node/cn-p-da42e6cfdcd1.html |
| ／死／神／ | 99 | https://lotmfanwiki.com/node/cn-p-8653377d38f9.html |
| ／霍／尔／伯／爵／ | 98 | https://lotmfanwiki.com/node/cn-p-f5768e8e8f15.html |

**重要：**「未匹配」並非「全新角色」，例如某些人已有長名、別名或與神性身分關聯，會被暫列未匹配；「已匹配」也只是候選關聯，須使用者審核。

## 後續步驟
1. 逐頁查核未匹配頁面是否在118名既有角色中以其他名字存在。
2. 真正缺少的角色才建立新的 `character_id`，並設計人類、神靈、分身、融合惡靈的身份關係。
3. 優先補A/B級人物的人生階段、力量變遷、組織時序，不再把三段摘要當完整傳記。
4. 原作準確性由使用者最終驗收，任何未審頁面標記 `pending`。
