import type { Locale } from './i18n';

const copy = {
  'zh-TW': {
    nav: {
      home: '首頁',
      methodology: '方法學',
      sources: '資料來源',
      pipeline: '管線狀態',
    },
    methodology: {
      eyebrow: '可稽核的計分規則',
      title: '缺值不補零，衝突不猜測',
      body: '本專案將身分、原始證據、正規化、計分與發布分層，每個發布結果都能追回不可變快照。',
      principles: [
        [
          '證據先於排名',
          '先保存原始 bytes、HTTP metadata 與 SHA-256，再解析與審核。',
        ],
        [
          '正規身分',
          '模糊比對只能提示，不能自動合併模型；每個來源別名都有明確決定。',
        ],
        [
          '缺值保持 null',
          '不支援或不完整的維度顯示 N/A，不以零、平均或競品分數插值。',
        ],
        [
          '衝突關閉發布',
          '同一正規鍵的不同分數會阻擋自動發布，直到有來源支持的優先規則。',
        ],
        [
          '快照不可變',
          'Edition 只切換 active pointer；計分快照、內容 hash 與稽核鏈不回寫。',
        ],
        [
          '正式與預覽分離',
          '覆蓋不足的真實資料只能以 PREVIEW 啟用；虛構 UI fixture 永不得進入正式發布。',
        ],
      ],
      flowTitle: '證據到發布',
      flow: [
        '允許的 HTTPS 來源',
        '不可變原始快照',
        '驗證與別名審查',
        '任務級結果',
        '缺值安全計分',
        '不可變 ranking snapshot',
        '交易式 Edition 啟用',
      ],
    },
    sources: {
      eyebrow: '來源登錄表',
      title: '只顯示已進入證據系統的來源',
      body: '下列狀態由 PostgreSQL 的 source、snapshot 與 ingestion run 實時組裝；尚在研究的候選來源不會被冒充為已連線。',
      enabled: '啟用',
      disabled: '停用',
      type: '類型',
      trust: '信任層級',
      license: '授權',
      snapshots: '原始快照',
      latestFetch: '最近擷取',
      latestRun: '最近 ingestion',
      accepted: '接受列數',
      noRun: '尚無執行記錄',
    },
    pipeline: {
      eyebrow: '實時讀取狀態',
      title: '從證據到 Edition 的管線',
      body: '數值直接來自資料庫，只表示已持久化的系統狀態，不代表所有資料已達正式發布門檻。',
      sources: '已登錄來源',
      snapshots: '原始快照',
      runs: 'Ingestion runs',
      staged: '分期列',
      published: '已發布結果',
      rankings: 'Ranking snapshots',
      editions: 'Editions',
      active: '目前 Active Edition',
      noActive: '無 active edition',
      latestRun: '最近 ingestion run',
      seenAccepted: '看見 / 接受',
    },
  },
  en: {
    nav: {
      home: 'Home',
      methodology: 'Methodology',
      sources: 'Sources',
      pipeline: 'Pipeline status',
    },
    methodology: {
      eyebrow: 'Auditable scoring rules',
      title: 'Missing stays missing; conflicts are never guessed',
      body: 'Identity, raw evidence, normalization, scoring, and publication are separate layers. Every published result traces back to an immutable snapshot.',
      principles: [
        [
          'Evidence before rank',
          'Exact bytes, HTTP metadata, and SHA-256 are stored before parsing and review.',
        ],
        [
          'Canonical identity',
          'Fuzzy matches may suggest but never merge models; every source alias has an explicit decision.',
        ],
        [
          'Missing stays null',
          'Unsupported or incomplete dimensions show N/A; zero, cohort averages, and competitor values are never imputed.',
        ],
        [
          'Conflicts stop publication',
          'Different scores for one canonical key block automation until a source-backed precedence rule exists.',
        ],
        [
          'Snapshots are immutable',
          'Editions switch an active pointer; scoring snapshots, hashes, and audit chains are not rewritten.',
        ],
        [
          'Formal and preview are separate',
          'Incomplete real data may activate only as PREVIEW; fictional UI fixtures can never enter formal publication.',
        ],
      ],
      flowTitle: 'Evidence to publication',
      flow: [
        'Allowlisted HTTPS source',
        'Immutable raw snapshot',
        'Validation and alias review',
        'Task-level results',
        'Null-safe scoring',
        'Immutable ranking snapshot',
        'Transactional edition activation',
      ],
    },
    sources: {
      eyebrow: 'Source registry',
      title: 'Only sources inside the evidence system are shown',
      body: 'Status is assembled live from PostgreSQL source, snapshot, and ingestion-run records. Research candidates are not presented as connected sources.',
      enabled: 'Enabled',
      disabled: 'Disabled',
      type: 'Type',
      trust: 'Trust tier',
      license: 'License',
      snapshots: 'Raw snapshots',
      latestFetch: 'Latest fetch',
      latestRun: 'Latest ingestion',
      accepted: 'Accepted rows',
      noRun: 'No run recorded',
    },
    pipeline: {
      eyebrow: 'Live read status',
      title: 'The evidence-to-edition pipeline',
      body: 'Counts come directly from the database and represent persisted system state. They do not imply that every row passes formal publication gates.',
      sources: 'Registered sources',
      snapshots: 'Raw snapshots',
      runs: 'Ingestion runs',
      staged: 'Staged rows',
      published: 'Published results',
      rankings: 'Ranking snapshots',
      editions: 'Editions',
      active: 'Active edition',
      noActive: 'No active edition',
      latestRun: 'Latest ingestion run',
      seenAccepted: 'Seen / accepted',
    },
  },
} as const;

export const getInfoCopy = (locale: Locale) => copy[locale];
export type InfoCopy = ReturnType<typeof getInfoCopy>;
