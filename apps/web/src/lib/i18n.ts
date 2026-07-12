import type { DimensionId } from '@llm-bench/contracts';

export const locales = ['zh-TW', 'en'] as const;
export type Locale = (typeof locales)[number];

export interface Dictionary {
  meta: {
    title: string;
    description: string;
  };
  brand: string;
  nav: {
    rankings: string;
    compare: string;
    methodology: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    previewBadge: string;
    previewNotice: string;
  };
  edition: string;
  dataCutoff: string;
  ranking: string;
  selectedModel: string;
  fieldAverage: string;
  overallScore: string;
  coverage: string;
  confidence: string;
  weeklyChange: string;
  capabilityProfile: string;
  capabilityDescription: string;
  modelListHint: string;
  evidenceTitle: string;
  evidenceBody: string;
  pipelineTitle: string;
  pipelineSteps: readonly string[];
  sourceStatus: string;
  sourceReady: string;
  stagedRows: string;
  publishedRows: string;
  methodologyTitle: string;
  methodologyBody: string;
  missingDataRule: string;
  theme: {
    label: string;
    editorial: string;
    studio: string;
  };
  language: string;
  footer: string;
  dimensions: Record<DimensionId, string>;
}

const dictionaries: Record<Locale, Dictionary> = {
  'zh-TW': {
    meta: {
      title: 'LLM 雷達｜可追溯的模型能力排行榜',
      description: '用八維能力、覆蓋率與證據鏈理解大型語言模型。',
    },
    brand: 'LLM 雷達',
    nav: { rankings: '排行榜', compare: '模型比較', methodology: '方法學' },
    hero: {
      eyebrow: '每週模型能力觀測',
      title: '看懂模型實力，\n不只看一個總分。',
      body: '把公開評測轉成可追溯的八維能力圖；每個分數都保留版本、覆蓋率與原始證據。',
      previewBadge: '設計預覽',
      previewNotice:
        '下列模型與分數為介面測試資料，不是 LiveBench 正式結果。正式發布會由審核後的 ranking snapshot 自動取代。',
    },
    edition: '2026 第 28 週',
    dataCutoff: '資料截止 07.11 · 20:30',
    ranking: '本週能力排行',
    selectedModel: '目前模型',
    fieldAverage: '本輪平均',
    overallScore: '綜合分數',
    coverage: '資料覆蓋',
    confidence: '可信度',
    weeklyChange: '週變動',
    capabilityProfile: '八維能力剖面',
    capabilityDescription: '固定軸序與 0–100 絕對尺度；切換主題不改變幾何。',
    modelListHint: '選擇模型以更新雷達與指標',
    evidenceTitle: '證據先於排名',
    evidenceBody:
      '原始回應以 SHA-256 保存，通過欄位驗證、模型別名解析與人工審核後，才會進入正式分數。',
    pipelineTitle: '本週資料管線',
    pipelineSteps: ['官方來源', '不可變快照', '欄位驗證', '待模型解析'],
    sourceStatus: 'LiveBench connector',
    sourceReady: '單頁 staging 就緒',
    stagedRows: '已驗證暫存',
    publishedRows: '正式發布',
    methodologyTitle: '缺資料，不補零',
    methodologyBody:
      '缺失維度會顯示 N/A 並斷開雷達線段。只有達到覆蓋率與獨立證據門檻的模型才能進入正式排名。',
    missingDataRule: 'PROVISIONAL · 預覽資料',
    theme: { label: '視覺主題', editorial: '編輯室', studio: '影像棚' },
    language: 'English',
    footer: '以方法透明、來源可追溯為設計原則。',
    dimensions: {
      reasoning: '科學推理',
      math: '數學',
      knowledge: '知識',
      language: '長文本',
      instruction: '指令遵循',
      coding: '程式設計',
      agentic: '工具調用',
      context: '事實可靠',
    },
  },
  en: {
    meta: {
      title: 'LLM Radar | Evidence-backed model rankings',
      description:
        'Understand language models through eight capabilities, coverage, and evidence.',
    },
    brand: 'LLM Radar',
    nav: {
      rankings: 'Rankings',
      compare: 'Compare',
      methodology: 'Methodology',
    },
    hero: {
      eyebrow: 'Weekly model capability watch',
      title: 'See model capability,\nnot just one score.',
      body: 'Public evaluations become an auditable eight-axis profile, with version, coverage, and raw evidence attached to every score.',
      previewBadge: 'Design preview',
      previewNotice:
        'The models and scores below are interface test data, not official LiveBench results. A reviewed ranking snapshot will replace them at publication.',
    },
    edition: 'Week 28 · 2026',
    dataCutoff: 'Data cutoff Jul 11 · 20:30',
    ranking: 'Capability ranking',
    selectedModel: 'Selected model',
    fieldAverage: 'Field average',
    overallScore: 'Overall score',
    coverage: 'Coverage',
    confidence: 'Confidence',
    weeklyChange: 'Weekly change',
    capabilityProfile: 'Eight-axis capability profile',
    capabilityDescription:
      'Fixed axis order on an absolute 0–100 scale; themes never change geometry.',
    modelListHint: 'Choose a model to update the radar and metrics',
    evidenceTitle: 'Evidence before rank',
    evidenceBody:
      'Raw responses are stored by SHA-256. Results enter formal scoring only after schema validation, model alias resolution, and review.',
    pipelineTitle: 'This week’s data pipeline',
    pipelineSteps: [
      'Official source',
      'Immutable snapshot',
      'Schema validated',
      'Alias review',
    ],
    sourceStatus: 'LiveBench connector',
    sourceReady: 'Single-page staging ready',
    stagedRows: 'Validated staged',
    publishedRows: 'Formally published',
    methodologyTitle: 'Missing is never zero',
    methodologyBody:
      'Missing axes show N/A and break the radar path. Only models meeting coverage and independent-evidence thresholds enter verified rankings.',
    missingDataRule: 'PROVISIONAL · PREVIEW DATA',
    theme: { label: 'Visual theme', editorial: 'Editorial', studio: 'Studio' },
    language: '繁體中文',
    footer: 'Designed for transparent methods and traceable sources.',
    dimensions: {
      reasoning: 'Reasoning',
      math: 'Mathematics',
      knowledge: 'Knowledge',
      language: 'Long context',
      instruction: 'Instruction',
      coding: 'Coding',
      agentic: 'Tool use',
      context: 'Reliability',
    },
  },
};

export function isLocale(input: string): input is Locale {
  return locales.includes(input as Locale);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
