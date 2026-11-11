# 勢力總表與人物隸屬：第一批研究成果 v0.1

## 已收集
- 英文百科隱秘組織候選：34條（`lore/organizations/index.json`）
- 跨類別新種子：47條（`lore/organizations/cross_category_seed_v0.1.json`）
- 去重後**暫有79個不同 ID**，包括教會、官方非凡者、家族、派系、歷史機構、地方團體與若干上位集合。**不是79個已核實獨立組織**。
- 人物：**74名**（`lore/characters/index_v0.1.json`）
- 人物—組織關係：**86筆**（`lore/characters/affiliations_v0.1.json`）
- 尚無確認正式隸屬者：**5名**（`lore/characters/unresolved_affiliation_v0.1.json`）

## 廣義來源母體
- 中文人物索引標示1,368筆： https://lotmfanwiki.com/type/p.html
- 中文組織索引標示513筆，其中95個有獨立頁： https://lotmfanwiki.com/type/o.html
- 英文維基隱秘組織： https://lordofthemysteries.fandom.com/wiki/List_of_Secret_Organizations
- 英文維基角色隸屬分類： https://lordofthemysteries.fandom.com/wiki/Category:Characters_by_Affiliation
- 更多可核對成員表：`Tarot_Club/List_of_Members`、`Nighthawks/List_of_Members`、`Rose_School_of_Thought/List_of_Members`、`Aurora_Order/List_of_Members`、`Psychology_Alchemists/List_of_Members`、`Demoness_Sect/List_of_Members`、`Element_Dawn/List_of_Members`（均在 lordofthemysteries.fandom.com/wiki/ 下）

## 關鍵設計
1. **人物、組織、隸屬關係分表。** 一個人可以同時或先後有多段隸屬；家族與真正的組織成員身分須分開。
2. **暫無組織 ≠ 無組織。** 未核實項統一放 `unresolved_affiliation`，避免漏掉海盜團、合作派系等。
3. **時間不可亂猜。** 本次成員資料由百科跨兩部的名單提取，`time_from`/`time_to` 暫設 null；不得推論「1349年就已加入」。
4. **人物別名不是新人物。** 例如克萊恩、格爾曼、愚者不得直接算成三個人；匿名稱號如「橙之魔女」有待研究能否與具名人物合併。
5. **上下級與派系不能重複算獨立組織。** 大阿卡那牌之於塔羅會、紅手套之於值夜者、節制派之於玫瑰學派要有 `parent_id`。

## 此版本已驗證
- 74個人物 ID 唯一。
- 全部86筆隸屬關係的人物 ID、組織 ID 均能在已收錄資料內找到。
- 「未確認隸屬」的5名人物沒有在候選關係表內被重複標成已屬某組織。

## 下一輪優先
- 人物索引的其餘大量條目分批納入，先分成第一部／第二部，原作時序精確核對。
- 補齊剩餘組織類別；把95個獨立條目逐項比對現有資料，擴展到513條索引。
- 人物資料補首次登場章節、事件時點、派系、是否短暫滲透或偽裝。
- 核實每個組織的人物名單後，逐步把 `source_status` 從社群百科升級為有原作章節證據。
- 後續製作1349／1358／1360年度快照，不讓不同時期人物不當同時出場。
- 若跨來源同名但非同一角色，必須拆 ID；如同一角色的不同稱號則合併為 aliases。

**嚴謹性提醒：** 本次不是把小說全文逐章讀完，也不是已完整歸類1,368名人物。中文譯名可能存在不同版本，必要時先用英文名稱作主對照，待原文核對。
