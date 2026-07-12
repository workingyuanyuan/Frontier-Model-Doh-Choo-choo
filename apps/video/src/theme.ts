import type { VideoTheme } from './props';

export type VideoThemeTokens = {
  canvas: string;
  surface: string;
  surfaceMuted: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  comparison: string;
  comparisonSoft: string;
  positive: string;
  warning: string;
};

const themes: Record<VideoTheme, VideoThemeTokens> = {
  editorial: {
    canvas: '#eef3f6',
    surface: '#ffffff',
    surfaceMuted: '#f5f8fa',
    ink: '#17232d',
    muted: '#586a76',
    line: '#d8e1e7',
    accent: '#277cab',
    accentStrong: '#195d86',
    accentSoft: '#dbeaf3',
    comparison: '#d66d4b',
    comparisonSoft: '#f3dfd7',
    positive: '#167858',
    warning: '#a26b19',
  },
  studio: {
    canvas: '#f2f0ec',
    surface: '#fffefa',
    surfaceMuted: '#f7f5f0',
    ink: '#171a1e',
    muted: '#616561',
    line: '#ddd8ce',
    accent: '#4f69a8',
    accentStrong: '#354c88',
    accentSoft: '#e1e6f1',
    comparison: '#c96a46',
    comparisonSoft: '#f0ddd5',
    positive: '#2a7458',
    warning: '#9d6f29',
  },
};

export const getVideoTheme = (theme: VideoTheme): VideoThemeTokens =>
  themes[theme];
