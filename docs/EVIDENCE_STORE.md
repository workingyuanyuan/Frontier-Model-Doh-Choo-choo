# 證據儲存與操作

採集與處理紀錄保存於 `artifacts/evidence/store.sqlite`，原始 bytes 保存於內容定址 artifact store。資料庫使用 Node.js 24 內建 SQLite，沒有常駐服務。每次成功取得有獨立 capture ID，相同內容共用 blob；失敗取得也留下狀態。Source snapshot 保存一組完整檔案與引用，供明確選取、查詢與匯出。

## 首次初始化

```bash
pnpm install --frozen-lockfile
pnpm --filter @llm-bench/benchmark-data build
pnpm evidence init
pnpm evidence init --history
pnpm evidence verify
```

`init` 匯入目前保留的來源快照並盤點 artifacts。重跑以內容與 provenance 識別既有紀錄，不增加重複 capture／snapshot。原始檔沒有取得 metadata 時，只登記內容、大小與路徑；不推測來源或時間。

`--history` 額外掃描目前保留來源的可達 Git 歷史，匯入可由現存原始內容核對的快照；輸出 HEAD、shallow 狀態、涵蓋的 commit 數、匯入與略過筆數。`--history-limit N` 限制最近 N 個相關 commits。查詢歷史的範圍僅限已匯入資料；Git 內沒有保存的取得事件無法由提交時間推算。

新 checkout 可僅靠 Git 資料建立查詢環境，原始 bytes 的可用性由 `verify` 明確回報。完整採集歷史需要完整備份。靜態網站仍可直接從 Git 資料建置。

## 查詢

所有命令輸出 `schemaVersion: evidence-cli-v1` 的 JSON。成功退出 0；參數或執行錯誤退出 1；完整性驗證失敗退出 2。預設回傳摘要，列表接受 `--offset` 與 `--limit`，每頁最多 1,000 筆。`nextOffset` 用於讀取下一頁。

```bash
# 找模型成績與原始證據：包含候選列定位、來源 URL、hash 與 artifactPath
pnpm evidence find --model anthropic-claude-fable-5 --source deepswe --limit 5

# 查某來源的取得及處理歷史
pnpm evidence captures --source deepswe --from 2026-10-01T00:00:00Z
pnpm evidence failures --source deepswe
pnpm evidence snapshots --source deepswe --limit 10

# 使用上一個命令回傳的兩個 snapshot ID 比較原始內容與結構化資料
pnpm evidence diff --before <snapshot-id> --after <snapshot-id>

# 使用 evidence.sha256 查引用鏈；current 限制到目前選取的快照
pnpm evidence references --hash <sha256:digest> --scope history
pnpm evidence references --hash <sha256:digest> --scope current

# 依需要讀取指定快照檔案片段，或原始 bytes 的 base64 片段
pnpm evidence read --snapshot <snapshot-id> --file candidates.json --start 0 --length 4096
pnpm evidence raw --hash <sha256:digest> --start 0 --length 4096
```

來源查詢使用 source ID，時間區間使用取得時間；無取得時間的歷史資料保持 unknown。引用 JSON pointer 對應所選 snapshot 內的檔案，工作區檔案可能已更新，重現時應使用 snapshot ID 讀取。

## 取得、物化與快取

沿用 [操作手冊](OPERATIONS.md#2-刷新來源) 的來源命令。共同取得介面立即寫入每次取得；來源命令執行前保存基準，成功後將完整輸出保存為 SQLite snapshot，再匯出為 JSON。失敗時還原基準；原始取得歷史仍保留。

```bash
pnpm data:materialize-snapshots
pnpm data:materialize-snapshots -- --force
pnpm data:materialize-costs
```

離線物化以完整 Evidence 輸入集合、解析程式內容版本與 mappings 設定決定快取。Evidence 的 URL、取得時間及 metadata 也是輸入，避免同 bytes 不同脈絡誤用。共用解析器或設定改變時採保守失效策略。快取命中仍核對輸入檔案雜湊；跨來源比對與衍生 effort 報告重新計算。命令回報命中、失效理由、解析來源數與耗時。

`--force` 完整重新解析，可用於比較增量結果。快取內部產出與可發布來源快照分別保存，匯出使用通過來源驗證的完整快照。

## 匯出與 Git 工作流程

```bash
pnpm evidence export --snapshot <snapshot-id>
pnpm data:build-current
```

SQLite 保存取得與處理歷史；Git 保存審查與部署選定的 JSON 投影。匯出需要明確 snapshot ID，不以資料庫最新紀錄自動取代目前分支。切換分支或 Git revert 後，執行 `pnpm evidence init` 將該 checkout 的資料登記為目前選取的快照，再進行來源作業。Git 回復產品版本不刪除本機採集歷史。

同樣輸入與設定經完整／增量物化應產生相同結構化內容；ProductVersion 由既有 deterministic builder 計算。採集及物化不直接發布產品。

## 備份、還原與中斷恢復

```bash
pnpm evidence backup --directory /path/to/new-backup
pnpm evidence restore --root /path/to/new-checkout --directory /path/to/new-backup
pnpm evidence verify --root /path/to/new-checkout
pnpm evidence recover
```

備份包含一致的 SQLite 副本、登記的原始檔與 SHA-256 manifest。還原先核對備份，再寫入指定 root；路徑以專案相對路徑保存。備份目的地使用新目錄，完整還原使用沒有既存資料庫的目錄。還原後可選取 snapshot 匯出。程式碼與人工設定由相應 Git checkout 提供。

SQLite 交易保護紀錄；匯出使用可恢復的寫入紀錄。下次開啟 store 時自動完成待處理匯出，來源命令中斷則恢復基準。`recover` 執行恢復後再核對內容與引用。資料庫 `user_version` 管理 schema 版本，較新且不支援的版本會拒絕開啟；升級前應備份。

Linux／WSL 在 Linux 檔案系統執行上述命令。Windows 使用同版本 Node.js 與 pnpm，在 PowerShell 執行相同命令並替換路徑；在目標平台重新安裝依賴。備份與還原透過 CLI 搬移，避免複製使用中的 SQLite WAL 檔案。

## 維護責任

| 資料                                                                     | 類型與權威來源                                     | 寫入入口                                         |
| ------------------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------ |
| `data/mappings/` 中模型、alias、benchmark、profile、品質及來源政策       | 人工設定，Git                                      | 依操作手冊審核後編輯                             |
| `frontier-set.json`、`frontier-selection-audit.json`、`display-set.json` | 產生結果，Git 投影                                 | 既有集合生成器／產品建置                         |
| `data/sources/*/evidence-index.json`、`candidates.json`、`costs.json`    | 產生結果，SQLite snapshot                          | 共用來源作業、物化、明確 snapshot 匯出           |
| `data/sources/*/manifest.json`、驗證與交叉檢查報告                       | 來源作業輸出，SQLite snapshot；初始描述由 Git 匯入 | 來源 adapter、物化與匯出；描述修訂需明確重新匯入 |
| 其他保留在來源目錄的研究／驗證輸入                                       | 初始化時匯入，後續隨完整 snapshot 保存             | 明確 `init` 與來源作業                           |
| `data/product/current.json`                                              | 產品建置結果，Git                                  | `pnpm data:build-current`                        |
| `data/source-monitoring/`                                                | 來源監測結果，Git                                  | `report:source-changes`／刷新監測                |
| `artifacts/sha256/`                                                      | 不可變原始 bytes                                   | 共用取得介面                                     |
| `artifacts/evidence/store.sqlite`                                        | 取得、快照、依賴與快取權威紀錄                     | EvidenceStore 與統一 CLI                         |

人工設定修訂仍由 Git 管理。來源 JSON 的直接修訂需明確 `init` 匯入才成為資料庫快照，匯出不會反向猜測工作區的意圖。
