import type { CSSProperties, ReactNode } from 'react';

import { AbsoluteFill, interpolate } from 'remotion';

import type { VideoCopy } from './copy';
import { scenes } from './timeline';
import type { VideoThemeTokens } from './theme';

export const sans = 'Arial, "Microsoft JhengHei", "PingFang TC", sans-serif';
export const serif = 'Georgia, "Microsoft JhengHei", "Songti TC", serif';

export const sceneDuration = (id: (typeof scenes)[number]['id']) => {
  const scene = scenes.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown video scene: ${id}`);
  return scene.to - scene.from + 1;
};

export const sceneOpacity = (frame: number, duration: number) =>
  interpolate(frame, [0, 14, duration - 15, duration - 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const Surface = ({
  children,
  tokens,
  style,
}: {
  children: ReactNode;
  tokens: VideoThemeTokens;
  style?: CSSProperties;
}) => (
  <div
    style={{
      border: `2px solid ${tokens.line}`,
      borderRadius: 42,
      background: tokens.surface,
      boxShadow: '0 28px 80px rgba(31, 55, 70, 0.10)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Brand = ({
  copy,
  tokens,
}: {
  copy: VideoCopy;
  tokens: VideoThemeTokens;
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
    <div
      style={{
        width: 58,
        height: 58,
        position: 'relative',
        borderRadius: 18,
        border: `2px solid ${tokens.line}`,
        background: tokens.surface,
      }}
    >
      {[
        { x: 16, h: 25, r: -22 },
        { x: 28, h: 36, r: 0 },
        { x: 40, h: 20, r: 22 },
      ].map(({ x, h, r }, index) => (
        <span
          key={x}
          style={{
            width: 5,
            height: h,
            position: 'absolute',
            left: x,
            bottom: 11,
            borderRadius: 99,
            background: index === 2 ? tokens.comparison : tokens.accent,
            transform: `rotate(${r}deg)`,
            transformOrigin: 'bottom',
          }}
        />
      ))}
    </div>
    <strong style={{ fontFamily: sans, fontSize: 28, color: tokens.ink }}>
      {copy.brand}
    </strong>
  </div>
);

export const Header = ({
  copy,
  tokens,
  section,
}: {
  copy: VideoCopy;
  tokens: VideoThemeTokens;
  section: string;
}) => (
  <div
    style={{
      height: 108,
      position: 'absolute',
      inset: '0 72px auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `2px solid ${tokens.line}`,
    }}
  >
    <Brand copy={copy} tokens={tokens} />
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        color: tokens.muted,
        fontFamily: sans,
        fontSize: 20,
      }}
    >
      <span>{section}</span>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: 99,
          background: tokens.positive,
        }}
      />
      <span>{copy.edition}</span>
    </div>
  </div>
);

export const PreviewBadge = ({
  copy,
  tokens,
}: {
  copy: VideoCopy;
  tokens: VideoThemeTokens;
}) => (
  <span
    style={{
      padding: '10px 18px',
      borderRadius: 999,
      border: `2px solid ${tokens.warning}`,
      color: tokens.warning,
      fontFamily: sans,
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: 1,
    }}
  >
    {copy.preview}
  </span>
);

export const SceneBase = ({
  children,
  tokens,
  opacity,
}: {
  children: ReactNode;
  tokens: VideoThemeTokens;
  opacity: number;
}) => (
  <AbsoluteFill
    style={{
      opacity,
      overflow: 'hidden',
      background: `radial-gradient(circle at 8% 0%, ${tokens.accentSoft}, transparent 34%), ${tokens.canvas}`,
      color: tokens.ink,
    }}
  >
    {children}
  </AbsoluteFill>
);
