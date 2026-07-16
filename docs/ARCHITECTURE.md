# 新版架構

## 邊界

新版由靜態資料工作區、純資料套件與單頁 Next.js Dashboard 組成。PostgreSQL、Docker、舊 Worker、Edition 與 LiveBench 專用流程不在目標架構內。

```text
來源頁/API/匯出
      │
      ▼
Git 外 artifacts-v2/sha256
      │
      ▼
data-v2/sources/<source>/
  manifest + evidence-index + candidates + validation
      │
      ▼
packages/benchmark-data
  身份選擇 → Frontier 聯集 → 八維計分 → ProductVersion
      │
      ▼
data-v2/product/versions/<sha256>.json
      │
      ├── pointers/draft.json
      └── pointers/published.json
             │
             ▼
         apps/bench
```

## 工作區責任

### `packages/benchmark-data`

- 版本化 Zod Schema。
- 來源角色與同配置結果取代規則。
- 動態綜合榜 Top 20 聯集與人工新品設定。
- 缺失值安全的八維計分。
- ProductVersion deterministic JSON 與內容雜湊。
- Draft、Published 與 rollback 的原子 pointer 操作。

### `packages/acquisition`

- 內容定址 artifact 寫入與 hash 驗證。
- 人眼可見列數、分頁與結構化／畫面衝突報告。
- Candidate 對 Evidence 的引用完整性檢查。

### `data-v2`

- `mappings/` 是可修改設定，不把八維或 Frontier 規則寫死在 UI。
- `sources/` 保存可審查的結構化輸出；原始大檔只保存 locator、hash 與 byte length。
- `product/versions/` 只能新增，不得覆寫。
- `product/pointers/` 是唯一可變發布狀態。

### `apps/bench`

- 靜態建置時讀取指定 channel pointer 與 ProductVersion。
- Draft Preview 與 Published 使用同一套 UI。
- 不連接資料庫、Worker、artifact store 或來源網站。
- 即使無網路、來源失效或 artifact store 暫時不可用，既有版本仍能建置。

## 失敗安全

- 擷取失敗不會改動既有 Draft 或 Published。
- Draft 生成失敗不寫 pointer。
- Published 切換前驗證目標版本存在且內容 hash 正確。
- Published 失敗時舊 pointer 不變。
- rollback 指向上一個不可變版本，不修改歷史資料。

## 移轉狀態

舊 `apps/web`、`apps/worker`、`packages/db` 與相關 CI 尚未移除，原因是首次 Published 與 rollback 仍需人工驗收。完成該閘門後，依 [可捨棄項目](REFACTOR_DISCARD_LIST.md) 一次移除，不保留相容層。
