import { Easing, interpolate, useCurrentFrame } from 'remotion';

import type { VideoCopy } from './copy';
import {
  Brand,
  Header,
  SceneBase,
  Surface,
  sans,
  sceneDuration,
  sceneOpacity,
  serif,
} from './scene-kit';
import type { VideoThemeTokens } from './theme';
export const EvidenceScene = ({
  copy,
  tokens,
}: {
  copy: VideoCopy;
  tokens: VideoThemeTokens;
}) => {
  const frame = useCurrentFrame();
  const duration = sceneDuration('evidence');
  const reveal = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <SceneBase tokens={tokens} opacity={sceneOpacity(frame, duration)}>
      <Header copy={copy} tokens={tokens} section={copy.evidence} />
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          top: 165,
          bottom: 78,
          display: 'grid',
          gridTemplateColumns: '1.15fr 0.85fr',
          gap: 30,
        }}
      >
        <Surface
          tokens={tokens}
          style={{
            padding: 46,
            opacity: reveal,
            transform: `translateX(${(1 - reveal) * -35}px)`,
          }}
        >
          <span
            style={{
              color: tokens.accent,
              fontFamily: sans,
              fontSize: 18,
              letterSpacing: 2,
            }}
          >
            03 · EVIDENCE
          </span>
          <h2
            style={{ margin: '20px 0 12px', fontFamily: serif, fontSize: 58 }}
          >
            {copy.evidence}
          </h2>
          <p
            style={{
              maxWidth: 850,
              margin: 0,
              color: tokens.muted,
              fontFamily: sans,
              fontSize: 25,
              lineHeight: 1.55,
            }}
          >
            {copy.evidenceBody}
          </p>
          <div
            style={{
              marginTop: 48,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
            }}
          >
            {copy.pipeline.map((step, index) => {
              const stepReveal = interpolate(
                frame,
                [16 + index * 8, 35 + index * 8],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
              );
              return (
                <div
                  key={step}
                  style={{
                    position: 'relative',
                    textAlign: 'center',
                    opacity: stepReveal,
                  }}
                >
                  <div
                    style={{
                      height: 2,
                      position: 'absolute',
                      left: index === 0 ? '50%' : 0,
                      right: index === 3 ? '50%' : 0,
                      top: 24,
                      background: tokens.line,
                    }}
                  />
                  <span
                    style={{
                      width: 50,
                      height: 50,
                      position: 'relative',
                      display: 'inline-grid',
                      placeItems: 'center',
                      borderRadius: 99,
                      border: `2px solid ${index === 3 ? tokens.warning : tokens.positive}`,
                      background:
                        index === 3 ? tokens.surface : tokens.positive,
                      color: index === 3 ? tokens.warning : '#fff',
                      fontFamily: sans,
                      fontSize: 18,
                    }}
                  >
                    {index + 1}
                  </span>
                  <strong
                    style={{
                      display: 'block',
                      marginTop: 16,
                      fontFamily: sans,
                      fontSize: 18,
                    }}
                  >
                    {step}
                  </strong>
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 62,
              padding: '25px 28px',
              display: 'grid',
              gridTemplateColumns: '1.7fr 1fr 1fr',
              border: `2px solid ${tokens.line}`,
              borderRadius: 24,
              background: tokens.surfaceMuted,
            }}
          >
            <div>
              <span
                style={{ color: tokens.muted, fontFamily: sans, fontSize: 16 }}
              >
                SHA-256
              </span>
              <code
                style={{
                  display: 'block',
                  marginTop: 12,
                  color: tokens.accentStrong,
                  fontFamily: 'Consolas, monospace',
                  fontSize: 19,
                }}
              >
                f42c1e18…1fac1f5
              </code>
            </div>
            <div
              style={{
                paddingLeft: 24,
                borderLeft: `2px solid ${tokens.line}`,
              }}
            >
              <span
                style={{ color: tokens.muted, fontFamily: sans, fontSize: 16 }}
              >
                {copy.staged}
              </span>
              <strong
                style={{
                  display: 'block',
                  marginTop: 10,
                  color: tokens.positive,
                  fontFamily: serif,
                  fontSize: 38,
                }}
              >
                100
              </strong>
            </div>
            <div
              style={{
                paddingLeft: 24,
                borderLeft: `2px solid ${tokens.line}`,
              }}
            >
              <span
                style={{ color: tokens.muted, fontFamily: sans, fontSize: 16 }}
              >
                {copy.published}
              </span>
              <strong
                style={{
                  display: 'block',
                  marginTop: 10,
                  color: tokens.warning,
                  fontFamily: serif,
                  fontSize: 38,
                }}
              >
                0
              </strong>
            </div>
          </div>
        </Surface>

        <Surface
          tokens={tokens}
          style={{
            padding: 46,
            opacity: reveal,
            transform: `translateX(${(1 - reveal) * 35}px)`,
          }}
        >
          <span
            style={{
              color: tokens.comparison,
              fontFamily: sans,
              fontSize: 18,
              letterSpacing: 2,
            }}
          >
            04 · MISSING DATA
          </span>
          <h2
            style={{ margin: '20px 0 14px', fontFamily: serif, fontSize: 55 }}
          >
            {copy.missingTitle}
          </h2>
          <p
            style={{
              margin: 0,
              color: tokens.muted,
              fontFamily: sans,
              fontSize: 24,
              lineHeight: 1.55,
            }}
          >
            {copy.missingBody}
          </p>
          <div
            style={{
              height: 190,
              marginTop: 48,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {[0, 1].map((value) => (
              <span
                key={value}
                style={{
                  height: 8,
                  flex: 1,
                  borderRadius: 99,
                  background: tokens.accent,
                }}
              />
            ))}
            <span
              style={{
                width: 90,
                height: 90,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 99,
                border: `3px dashed ${tokens.warning}`,
                color: tokens.warning,
                fontFamily: sans,
                fontSize: 19,
              }}
            >
              N/A
            </span>
            {[0, 1].map((value) => (
              <span
                key={value}
                style={{
                  height: 8,
                  flex: 1,
                  borderRadius: 99,
                  background: tokens.comparison,
                }}
              />
            ))}
          </div>
          <div
            style={{
              marginTop: 55,
              paddingTop: 32,
              borderTop: `2px solid ${tokens.line}`,
            }}
          >
            <Brand copy={copy} tokens={tokens} />
            <strong
              style={{
                display: 'block',
                marginTop: 32,
                fontFamily: serif,
                fontSize: 34,
              }}
            >
              {copy.outro}
            </strong>
            <span
              style={{
                display: 'block',
                marginTop: 18,
                color: tokens.warning,
                fontFamily: sans,
                fontSize: 18,
              }}
            >
              {copy.disclaimer}
            </span>
          </div>
        </Surface>
      </div>
    </SceneBase>
  );
};
