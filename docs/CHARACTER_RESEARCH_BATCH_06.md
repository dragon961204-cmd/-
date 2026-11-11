# 第六輪人物考據紀錄 — 2026-11-11

## 此輪完成
- 新增9位重要人物／非人類角色候選，累計118筆人物唯一ID。
- 個別人物傳記初稿59 → 68份，其中仍有短稿；逐章核原作驗收通過為0。
- 人物—組織候選關係112 → 122筆。
- 廣義組織不同ID數80個（包含集合概念、家族及派系；非80個獨立隱秘結社）。
- 核對人物索引、組織索引、關係表與傳記追蹤表：重複人物ID 0、孤兒關係0、追蹤表孤兒紀錄0。

## 新增人物及二手章節定位
| ID | 人物 | 二手條目 | 可回查的小說節點 |
|---|---|---|---|
| bethel-abraham | 伯特利·亞伯拉罕 | https://lordofthemysteries.fandom.com/wiki/Bethel_Abraham | 第一部216提及、1294、1353 |
| antigonus | 安提哥努斯 | https://lordofthemysteries.fandom.com/wiki/Antigonus | 第32章囈語、1381直接登場 |
| sasrir | 薩斯利爾 | https://lordofthemysteries.fandom.com/wiki/Sasrir | 第666章提及、1259、1264 |
| ancient-sun-god | 遠古太陽神 | https://lordofthemysteries.fandom.com/wiki/Ancient_Sun_God | 第1033章；歷史橫跨第二、第三紀 |
| george-augustus-iii | 喬治三世 | https://lordofthemysteries.fandom.com/wiki/George_Augustus_III | 第4章提及、8章、1148章 |
| susie | 蘇茜 | https://lordofthemysteries.fandom.com/wiki/Susie | 第36章初登場、41章晉升，418章晉升（另見Susie/Progress） |
| frank-lee | 弗蘭克·李 | https://lordofthemysteries.fandom.com/wiki/Frank_Lee | 第638章初登場、1128章晉升 |
| anderson-hood | 安德森·胡德 | https://lordofthemysteries.fandom.com/wiki/Anderson_Hood | 海上篇及第672章線索 |
| dorian-gray-abraham | 多里安·格雷·亞伯拉罕 | https://lordofthemysteries.fandom.com/wiki/Dorian_Gray_Abraham | 第404章提及、407章登場、432章師徒事件 |

章節號來自社群人物頁，**未直接逐章對照小說內容**，故傳記均標註二手來源。需要回原作核查之後才能標記 verified。

## 世界觀資料建模的關鍵提醒
1. **蘇茜是非人類的個體角色。** 角色資料庫應允許具智慧非凡生物，不應把所有 characters 當成「人物中的人類」。
2. **伯特利與亞伯拉罕家族的關係是血統／家族，並非等同於一個可隨時加入的教會。**
3. **薩斯利爾、遠古太陽神、亞當、真實造物主的本體、分身與人格關係複雜。** 不可在未驗證之前合併ID；必要時另外建 identity_links，標記 `originates_from`、`split_personality` 和 `reincarnated_as`。
4. **蘇茜與霍爾家族的關係是家庭伴侶動物，而非伯爵家族血統成員。** 關係類型不能簡化為正式組織會員。
5. **喬治三世的祕密同盟和是否正式加入某結社須分辨。** 聯盟與隸屬是不同的資料。
6. **安德森與弗蘭克的海上船隊組織尚未獨立建 ID。** 需補黃金夢想號、未來號及附屬人員關係，暫不可標成正式無組織。
7. 塔羅會所有成員加入日期需以第一部章節核對： https://lordofthemysteries.fandom.com/wiki/Tarot_Club/List_of_Members
8. **不同年代的同一角色不應自動持有同樣的序列、身分和所屬組織。**
9. 原作人物背景與遊戲原創互動須分離儲存，不可把劇情設計反寫成原作正史。
10. `historical_sections` 長度不等於傳記真正完整：出身、家庭、動機、各階段重大轉折、入會離會時間與序列變動若未有證據，仍應標記「初稿」。

## 下一輪
- 優先補足第一部重要遺漏者：伊森格·斯坦頓、弗蘭克周邊船員、阿羅德斯、安德森相關人物、白銀城關鍵居民與第二部核心人物。
- 檢查早期建檔的明顯誤判與同名錯誤，尤其人物/組織/時序。
- 把章節號從 wiki locator 升為原作逐章證據，並統一 `sections` 與 `historical_sections` 結構。
