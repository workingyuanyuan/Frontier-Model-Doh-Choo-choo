# Workspace integration timing 失敗：coverage 搜尋拖慢 build（2026-11-24）

## 症狀

GitHub Actions「Workspace integration timing」（job `measure`）在 PR #90、#91、#92 失敗，例如 run 45343018473。`target-*` 與 `workspace-file-*` 全部通過，`full-suite-NN` 多數印出 `failed`，step 以 1 結束。

## 判定：測試真的失敗，量測腳本沒有誤報

`scripts/measure-workspace-tests.mjs` 只依子行程的退出碼印 `passed`／`failed`。上傳的 `full-suite-02.log` 顯示：

```
FAIL src/workspace.test.ts > buildWorkspaceProduct > preserves every existing preset and cost with the real FrontierSWE V2 snapshot
Error: Test timed out in 15000ms.
```

這個測試以 15 秒逾時作為整合預算（見 [2026-10-24 build 效能分析](2026-10-24-workspace-build-performance.md)）。單獨跑時遠低於預算；`pnpm test` 會讓 turbo 同時跑三個 package 的測試，四核 runner 上的競爭把同一段 build 放大約五倍。失敗與否取決於當輪競爭，所以 10 輪中有時過、有時不過。

## 根因：coverage 視窗擴到 20 個模型後，每次 build 的 CPU 加倍

各 run 的階段耗時（秒，`baseline-build` / `added-build`）：

| Run         | 對應 PR                | target 中位 | full-suite 範圍    | full-suite 結果 |
| ----------- | ---------------------- | ----------- | ------------------ | --------------- |
| 44999944723 | #87 ci/faster-pipeline | 0.9 / 0.7   | 1.8–5.0 / 2.0–3.0  | 10/10 通過      |
| 45038285900 | #90 coverage-window-20 | 2.0 / 1.8   | 5.7–10.7 / 4.6–7.2 | 2/10 通過       |
| 45189876651 | #91 daily refresh      | 2.1 / 1.8   | 5.3–11.4 / 4.5–6.6 | 3/10 通過       |
| 45343018473 | #92 Haiku 5.5          | 2.0 / 1.8   | 5.5–10.6 / 4.4–6.3 | 2/10 通過       |
| 45365635318 | #93 AA identity review | 1.3 / 1.1   | 3.2–6.9 / 2.7–4.5  | 10/10 通過      |

PR #90（`fe29095`）把 `createCoverageCohorts` 的視窗從 10 個模型擴到 20 個。搜尋維持窮舉，以 prefix 剪枝；以 11-24 的資料，19 個模型數合計走過約 62 萬個節點，每個節點都用 `new Set([...shared].filter(...))` 建一個新集合，再為葉節點排序並串接 key。CPU profile 顯示這段每次 build 約 750 ms，佔整次 build 約四成；測試一次跑兩個 build。PR #93 剛好因資料變動讓搜尋變小而通過，下一次資料刷新仍可能再度逾時。

## 修正

`createCoverageCohorts` 改用位元集合：把所有候選測試排序後編號，每個 profile 的測試轉成 `Uint32Array`，交集變成逐字 AND，大小用 popcount 計算；每層深度共用預先配置的緩衝區，`positions`／`choice` 改為可變堆疊，只在出現新的最佳解時複製。剪枝條件、走訪順序與平手規則都不變，因此結果與舊程式相同：

- `pnpm data:generate-frontier-set` 重新產生的 `data/derived/frontier-set.json` 與 audit 逐位元組相同。
- `pnpm data:release` 完成，`pnpm data:verify-fresh` 以已提交的 `current.json` 通過；另有新舊實作的差分抽查。見 [刷新報告](../refresh/2026-11-24-coverage-search-bitsets.md)。

## 量測

本機 Intel Core Ultra 9 285HX，以 `taskset -c 0-3` 限制為四核，`node scripts/measure-workspace-tests.mjs --iterations 3`。測試階段合計（毫秒）：

| 模式           | 修正前           | 修正後      |
| -------------- | ---------------- | ----------- |
| target         | 4,580–5,047      | 1,868–1,994 |
| workspace-file | 5,644–7,027      | 1,853–1,897 |
| full-suite     | 8,730–**14,936** | 2,878–6,949 |

修正前 full-suite 第三輪已到 14.9 秒，等於在本機重現逾時邊緣。修正後最壞情況仍留約 8 秒餘裕。整個 `pnpm test` 的牆鐘時間也從 20–27 秒降到約 13 秒。CPU profile 中 `createCoverageCohorts` 從每次 build 約 750 ms 降到約 110 ms。
