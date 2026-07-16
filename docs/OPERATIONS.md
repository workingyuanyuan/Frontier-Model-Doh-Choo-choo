# 操作與發布

## 原則

- Agent 平時只執行固定來源排程。
- 新模型推出時，由人工額外觸發一次收集。
- Candidate 與 Draft 可由 Agent 自動修正、合併與重建。
- Draft → Published 永遠需要人工操作，沒有新模型例外。
- 發布只切 pointer，不重新擷取或計分。
- Docker 永久不使用。

## 生成 Draft

```bash
pnpm data:v2:build-draft
```

流程：

1. 驗證八站 SourceManifest 與 CandidateResult。
2. 驗證 Included Benchmark 均有八維映射。
3. 建立綜合榜 Top 20 聯集。
4. 衍生 ModelProfile 與成本。
5. 計算八維與 Estimated 排名。
6. 寫入新的 `data-v2/product/versions/<sha256>.json`。
7. 目標版本成功寫入後才原子更新 `pointers/draft.json`。

既有版本不會被覆寫。

## 預覽 Dashboard

PowerShell：

```powershell
$env:LLM_BENCH_CHANNEL = "DRAFT"
pnpm --filter @llm-bench/bench dev
```

Published 建置：

```powershell
$env:LLM_BENCH_CHANNEL = "PUBLISHED"
pnpm --filter @llm-bench/bench build
```

Dashboard 在建置時讀取 pointer 與版本 JSON，不讀 artifact、來源網站或資料庫。

## 人工審查

審查者需同時核對：

- 來源頁或原始 artifact。
- `evidence-index.json`。
- `candidates.json`。
- `validation-report.md`。
- Dashboard 顯示。

問題分類：

- 擷取。
- 模型身份／Profile。
- Benchmark 映射。
- 標準化／計分。
- UI。

任何修正都生成新 Draft，不修改舊版本。

## 發布與回退

核准目前 Draft：

```bash
pnpm data:v2:publish
```

回退上一個 Published：

```bash
pnpm data:v2:rollback
```

安全條件：

- Draft pointer 不存在：發布失敗。
- 目標版本不存在或 hash 不符：發布失敗。
- 發布失敗：既有 Published pointer 不變。
- 無 previousVersionId：rollback 失敗。
- rollback 目標不存在：Published 不變。

## 驗證命令

```bash
pnpm --filter @llm-bench/benchmark-data test:run
pnpm --filter @llm-bench/benchmark-data typecheck
pnpm --filter @llm-bench/acquisition test:run
pnpm --filter @llm-bench/acquisition typecheck
pnpm --filter @llm-bench/bench test:run
pnpm --filter @llm-bench/bench typecheck
pnpm --filter @llm-bench/bench build
```

來源整合時另需重算所有 artifact SHA-256、byte length，並確認 Candidate evidenceIds 全部可解析。

## Artifact 保存

`artifacts-v2/` 不進 Git。正式排程需在擷取後把內容定址檔同步到耐久儲存，且不得只保存 Evidence metadata。若 artifact store 暫時不可用，既有 Published 仍可建置；但新的來源快照不得宣告驗證完成。

## 移除舊架構的閘門

只有在使用者：

1. 人工核准第一份 Draft；
2. 執行 Published A；
3. 核准第二份 Draft 並執行 Published B；
4. 驗證 rollback A；

之後，才移除舊 Web、Worker、DB、Compose、Edition、影片與舊 CI。移除前不得把暫留程式碼視為新版依賴。
