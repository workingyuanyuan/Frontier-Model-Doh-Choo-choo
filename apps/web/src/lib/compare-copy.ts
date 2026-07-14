import type { Locale } from './i18n';

const copy = {
  'zh-TW': {
    eyebrow: '可分享的模型比較',
    title: '並列比較 2–5 個模型',
    body: '選擇順序會寫入 URL。缺失的維度保持 N/A，不會補零或改變量尺。',
    selection: '比較模型',
    model: '模型',
    add: '新增模型',
    remove: '移除',
    apply: '套用並更新分享連結',
    minHint: '至少 2 個，最多 5 個不重複模型。',
    overall: '綜合分數',
    coverage: '覆蓋率',
    status: '狀態',
    flags: '資料品質標記',
    capabilityTable: '八維能力數據表',
    dimension: '能力維度',
    details: '查看詳細資料',
    back: '返回首頁',
  },
  en: {
    eyebrow: 'Shareable model comparison',
    title: 'Compare 2–5 models side by side',
    body: 'Selection order is encoded in the URL. Missing dimensions stay N/A; they are never filled with zero or rescaled.',
    selection: 'Comparison models',
    model: 'Model',
    add: 'Add model',
    remove: 'Remove',
    apply: 'Apply and update share link',
    minHint: 'Choose 2 to 5 unique models.',
    overall: 'Overall score',
    coverage: 'Coverage',
    status: 'Status',
    flags: 'Quality flags',
    capabilityTable: 'Eight-axis capability data',
    dimension: 'Capability',
    details: 'View details',
    back: 'Back to home',
  },
} as const;

export const getCompareCopy = (locale: Locale) => copy[locale];
export type CompareCopy = ReturnType<typeof getCompareCopy>;
