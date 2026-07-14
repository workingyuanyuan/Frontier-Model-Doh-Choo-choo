import type { DimensionId } from '@llm-bench/contracts';

import type { VideoLocale } from './props';

export type VideoCopy = {
  brand: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  preview: string;
  formal: string;
  disclaimer: string;
  edition: string;
  profile: string;
  profileNote: string;
  overall: string;
  coverage: string;
  confidence: string;
  weeklyChange: string;
  ranking: string;
  breakdown: string;
  evidence: string;
  evidenceBody: string;
  pipeline: readonly string[];
  staged: string;
  published: string;
  models: string;
  sources: string;
  missingTitle: string;
  missingBody: string;
  outro: string;
  dimensions: Record<DimensionId, string>;
};

const copy: Record<VideoLocale, VideoCopy> = {
  'zh-TW': {
    brand: 'LLM 雷達',
    eyebrow: '每週模型能力觀測',
    title: '看懂模型實力，\n不只看一個總分。',
    subtitle: '八維能力 · 覆蓋率 · 可追溯證據',
    preview: '設計預覽資料',
    formal: '正式發布資料',
    disclaimer: '介面測試資料，不是 LiveBench 正式結果',
    edition: '2026 第 28 週',
    profile: '八維能力剖面',
    profileNote: '固定軸序 · 0–100 絕對尺度',
    overall: '綜合分數',
    coverage: '資料覆蓋',
    confidence: '可信度',
    weeklyChange: '週變動',
    ranking: '本週能力排行',
    breakdown: '能力拆解',
    evidence: '證據先於排名',
    evidenceBody: '原始回應以 SHA-256 保存，驗證與審核後才進入正式分數。',
    pipeline: ['官方來源', '不可變快照', '欄位驗證', '待模型解析'],
    staged: '已驗證暫存',
    published: '正式發布',
    models: '模型數',
    sources: '來源快照',
    missingTitle: '缺資料，不補零',
    missingBody: '缺失維度顯示 N/A 並斷開雷達線段。',
    outro: '方法透明 · 來源可追溯',
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
    brand: 'LLM Radar',
    eyebrow: 'Weekly model capability watch',
    title: 'See model capability,\nnot just one score.',
    subtitle: 'Eight capabilities · Coverage · Traceable evidence',
    preview: 'Design preview data',
    formal: 'Formal published data',
    disclaimer: 'Interface test data — not official LiveBench results',
    edition: 'Week 28 · 2026',
    profile: 'Eight-axis capability profile',
    profileNote: 'Fixed axis order · Absolute 0–100 scale',
    overall: 'Overall score',
    coverage: 'Coverage',
    confidence: 'Confidence',
    weeklyChange: 'Weekly change',
    ranking: 'Capability ranking',
    breakdown: 'Capability breakdown',
    evidence: 'Evidence before rank',
    evidenceBody:
      'Raw responses are stored by SHA-256 and enter formal scoring only after validation and review.',
    pipeline: [
      'Official source',
      'Immutable snapshot',
      'Schema validated',
      'Alias review',
    ],
    staged: 'Validated staged',
    published: 'Formally published',
    models: 'Models',
    sources: 'Source snapshots',
    missingTitle: 'Missing is never zero',
    missingBody: 'Missing axes show N/A and break the radar path.',
    outro: 'Transparent methods · Traceable sources',
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

export const getVideoCopy = (locale: VideoLocale): VideoCopy => copy[locale];
