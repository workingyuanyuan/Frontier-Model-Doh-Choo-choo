import {
  RankingSnapshotSchema,
  type RankingSnapshot,
} from '@llm-bench/contracts';

export type VideoLocale = 'zh-TW' | 'en';
export type VideoTheme = 'editorial' | 'studio';

export type LlmBenchVideoProps = {
  snapshot: RankingSnapshot;
  locale: VideoLocale;
  theme: VideoTheme;
  selectedModelIndex: number;
};

export function validateVideoProps(input: unknown): LlmBenchVideoProps {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Video props must be an object');
  }

  const candidate = input as Record<string, unknown>;
  const snapshot = RankingSnapshotSchema.parse(candidate.snapshot);
  const locale = candidate.locale;
  const theme = candidate.theme;
  const selectedModelIndex = candidate.selectedModelIndex;

  if (locale !== 'zh-TW' && locale !== 'en') {
    throw new Error('Video locale must be zh-TW or en');
  }

  if (theme !== 'editorial' && theme !== 'studio') {
    throw new Error('Video theme must be editorial or studio');
  }

  if (
    !Number.isInteger(selectedModelIndex) ||
    (selectedModelIndex as number) < 0 ||
    (selectedModelIndex as number) >= snapshot.entries.length
  ) {
    throw new Error('Selected model index is outside the ranking snapshot');
  }

  return {
    snapshot,
    locale,
    theme,
    selectedModelIndex: selectedModelIndex as number,
  };
}
