import type {
  DimensionId,
  RankingEntry,
  RankingSnapshot,
} from '@llm-bench/contracts';
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import { getVideoCopy, type VideoCopy } from './copy';
import { EvidenceScene } from './evidence-scene';
import { formatVideoScore } from './format';
import { validateVideoProps, type LlmBenchVideoProps } from './props';
import { createFieldAverage, VideoRadar } from './radar';
import {
  Brand,
  Header,
  PreviewBadge,
  SceneBase,
  Surface,
  sans,
  sceneDuration,
  sceneOpacity,
  serif,
} from './scene-kit';
import { scenes } from './timeline';
import { getVideoTheme, type VideoThemeTokens } from './theme';

const IntroScene = ({
  copy,
  tokens,
  isPreview,
  editionDate,
}: {
  copy: VideoCopy;
  tokens: VideoThemeTokens;
  isPreview: boolean;
  editionDate: string;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = sceneDuration('intro');
  const reveal = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 95, mass: 0.8 },
  });
  const editionReveal = interpolate(frame, [22, 52], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <SceneBase tokens={tokens} opacity={sceneOpacity(frame, duration)}>
      <div style={{ position: 'absolute', left: 86, top: 72 }}>
        <Brand copy={copy} tokens={tokens} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 92,
          top: 220,
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * 42}px)`,
        }}
      >
        <div
          style={{
            marginBottom: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            color: tokens.muted,
            fontFamily: sans,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          <span
            style={{
              width: 11,
              height: 11,
              borderRadius: 99,
              background: tokens.positive,
            }}
          />
          <span>{copy.eyebrow}</span>
          {isPreview ? <PreviewBadge copy={copy} tokens={tokens} /> : null}
        </div>
        <h1
          style={{
            maxWidth: 1270,
            margin: 0,
            fontFamily: serif,
            fontSize: 124,
            fontWeight: 500,
            lineHeight: 0.98,
            letterSpacing: -5,
            whiteSpace: 'pre-line',
          }}
        >
          {copy.title}
        </h1>
        <p
          style={{
            margin: '36px 0 0',
            color: tokens.muted,
            fontFamily: sans,
            fontSize: 31,
            letterSpacing: 1,
          }}
        >
          {copy.subtitle}
        </p>
      </div>

      <Surface
        tokens={tokens}
        style={{
          width: 370,
          height: 232,
          position: 'absolute',
          right: 86,
          top: 246,
          padding: 42,
          opacity: editionReveal,
          transform: `translateX(${(1 - editionReveal) * 50}px)`,
        }}
      >
        <span
          style={{
            color: tokens.muted,
            fontFamily: sans,
            fontSize: 18,
            letterSpacing: 2,
          }}
        >
          EDITION
        </span>
        <strong
          style={{
            display: 'block',
            marginTop: 25,
            fontFamily: serif,
            fontSize: 42,
          }}
        >
          {editionDate}
        </strong>
        <span
          style={{
            display: 'block',
            marginTop: 18,
            color: tokens.muted,
            fontFamily: sans,
            fontSize: 18,
          }}
        >
          2026.07.11 · 20:30
        </span>
      </Surface>

      <div
        style={{
          position: 'absolute',
          left: 92,
          right: 92,
          bottom: 48,
          paddingTop: 18,
          borderTop: `2px solid ${tokens.line}`,
          color: tokens.warning,
          fontFamily: sans,
          fontSize: 19,
        }}
      >
        {isPreview ? copy.disclaimer : copy.formal}
      </div>
    </SceneBase>
  );
};

const Metric = ({
  label,
  value,
  suffix,
  tokens,
  accent,
}: {
  label: string;
  value: string;
  suffix?: string;
  tokens: VideoThemeTokens;
  accent?: boolean;
}) => (
  <div style={{ padding: '23px 25px', borderTop: `2px solid ${tokens.line}` }}>
    <span
      style={{
        display: 'block',
        color: tokens.muted,
        fontFamily: sans,
        fontSize: 17,
      }}
    >
      {label}
    </span>
    <strong
      style={{
        display: 'inline-block',
        marginTop: 9,
        color: accent ? tokens.positive : tokens.ink,
        fontFamily: serif,
        fontSize: 42,
        fontWeight: 500,
      }}
    >
      {value}
    </strong>
    {suffix ? (
      <small
        style={{
          marginLeft: 7,
          color: tokens.muted,
          fontFamily: sans,
          fontSize: 15,
        }}
      >
        {suffix}
      </small>
    ) : null}
  </div>
);

const ProfileScene = ({
  copy,
  tokens,
  entry,
  fieldAverage,
  isPreview,
  editionDate,
}: {
  copy: VideoCopy;
  tokens: VideoThemeTokens;
  entry: RankingEntry;
  fieldAverage: Record<DimensionId, number | null>;
  isPreview: boolean;
  editionDate: string;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = sceneDuration('profile');
  const progress = spring({
    frame,
    fps,
    delay: 18,
    durationInFrames: 72,
    config: { damping: 20, stiffness: 90 },
  });
  const score = interpolate(progress, [0, 1], [0, entry.overallScore ?? 0]);

  return (
    <SceneBase tokens={tokens} opacity={sceneOpacity(frame, duration)}>
      <Header
        copy={copy}
        tokens={tokens}
        section={copy.profile}
        editionLabel={editionDate}
      />
      <Surface
        tokens={tokens}
        style={{
          width: 510,
          height: 820,
          position: 'absolute',
          left: 72,
          top: 150,
          padding: '42px 38px 0',
          overflow: 'hidden',
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
          {entry.rank === null ? 'N/A' : `#${entry.rank}`} ·{' '}
          {isPreview ? copy.preview : copy.formal}
        </span>
        <h2
          style={{
            margin: '25px 0 8px',
            fontFamily: serif,
            fontSize: 54,
            lineHeight: 1.05,
          }}
        >
          {entry.displayName}
        </h2>
        <span style={{ color: tokens.muted, fontFamily: sans, fontSize: 20 }}>
          {entry.providerName}
        </span>
        <div
          style={{
            margin: '45px 0 38px',
            display: 'flex',
            alignItems: 'baseline',
            gap: 10,
          }}
        >
          <strong style={{ fontFamily: serif, fontSize: 112, fontWeight: 500 }}>
            {formatVideoScore(entry.overallScore === null ? null : score)}
          </strong>
          {entry.overallScore !== null ? (
            <span
              style={{ color: tokens.muted, fontFamily: sans, fontSize: 21 }}
            >
              / 100
            </span>
          ) : null}
        </div>
        <Metric
          label={copy.coverage}
          value={`${Math.round(entry.overallCoverage * 100)}%`}
          tokens={tokens}
        />
        <Metric
          label={copy.confidence}
          value={String(Math.round(entry.overallConfidence))}
          suffix="/ 100"
          tokens={tokens}
        />
        <Metric label={copy.weeklyChange} value="N/A" tokens={tokens} />
      </Surface>

      <Surface
        tokens={tokens}
        style={{
          width: 1192,
          height: 820,
          position: 'absolute',
          right: 72,
          top: 150,
          padding: 20,
        }}
      >
        <div style={{ position: 'absolute', left: 40, top: 30, zIndex: 2 }}>
          <strong style={{ display: 'block', fontFamily: serif, fontSize: 38 }}>
            {copy.profile}
          </strong>
          <span
            style={{
              display: 'block',
              marginTop: 9,
              color: tokens.muted,
              fontFamily: sans,
              fontSize: 17,
            }}
          >
            {copy.profileNote}
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            right: 42,
            top: 35,
            display: 'flex',
            gap: 24,
            fontFamily: sans,
            fontSize: 16,
            color: tokens.muted,
          }}
        >
          <span>
            <i
              style={{
                display: 'inline-block',
                width: 28,
                height: 4,
                marginRight: 8,
                background: tokens.accent,
              }}
            />
            {entry.displayName}
          </span>
          <span>
            <i
              style={{
                display: 'inline-block',
                width: 28,
                marginRight: 8,
                borderTop: `4px dashed ${tokens.comparison}`,
              }}
            />
            AVG
          </span>
        </div>
        <div style={{ position: 'absolute', inset: '65px 45px 10px' }}>
          <VideoRadar
            entry={entry}
            fieldAverage={fieldAverage}
            progress={progress}
            copy={copy}
            tokens={tokens}
          />
        </div>
      </Surface>
    </SceneBase>
  );
};

const RankingScene = ({
  copy,
  tokens,
  snapshot,
  selected,
  isPreview,
  editionDate,
}: {
  copy: VideoCopy;
  tokens: VideoThemeTokens;
  snapshot: RankingSnapshot;
  selected: RankingEntry;
  isPreview: boolean;
  editionDate: string;
}) => {
  const frame = useCurrentFrame();
  const duration = sceneDuration('ranking');
  const enter = interpolate(frame, [0, 32], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <SceneBase tokens={tokens} opacity={sceneOpacity(frame, duration)}>
      <Header
        copy={copy}
        tokens={tokens}
        section={copy.ranking}
        editionLabel={editionDate}
      />
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          top: 158,
          bottom: 70,
          display: 'grid',
          gridTemplateColumns: '0.92fr 1.08fr',
          gap: 28,
        }}
      >
        <Surface tokens={tokens} style={{ padding: 38 }}>
          <h2 style={{ margin: 0, fontFamily: serif, fontSize: 45 }}>
            {copy.ranking}
          </h2>
          <div
            style={{
              marginTop: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {snapshot.entries.map((entry, index) => {
              const itemReveal = interpolate(
                frame,
                [10 + index * 5, 32 + index * 5],
                [0, 1],
                {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                },
              );
              return (
                <div
                  key={entry.modelVariantId}
                  style={{
                    minHeight: 137,
                    padding: '26px 28px',
                    display: 'grid',
                    gridTemplateColumns: '62px 1fr auto',
                    alignItems: 'center',
                    gap: 18,
                    borderRadius: 25,
                    border: `2px solid ${index === 0 ? tokens.accent : tokens.line}`,
                    background:
                      index === 0 ? tokens.accentSoft : tokens.surfaceMuted,
                    opacity: itemReveal,
                    transform: `translateX(${(1 - itemReveal) * -32}px)`,
                  }}
                >
                  <span
                    style={{
                      color: index === 0 ? tokens.accentStrong : tokens.muted,
                      fontFamily: serif,
                      fontSize: 28,
                    }}
                  >
                    {String(entry.rank).padStart(2, '0')}
                  </span>
                  <span>
                    <strong
                      style={{
                        display: 'block',
                        fontFamily: sans,
                        fontSize: 27,
                      }}
                    >
                      {entry.displayName}
                    </strong>
                    <small
                      style={{
                        display: 'block',
                        marginTop: 9,
                        color: tokens.muted,
                        fontFamily: sans,
                        fontSize: 17,
                      }}
                    >
                      {entry.providerName}
                    </small>
                  </span>
                  <strong
                    style={{ fontFamily: serif, fontSize: 43, fontWeight: 500 }}
                  >
                    {formatVideoScore(entry.overallScore)}
                  </strong>
                </div>
              );
            })}
          </div>
        </Surface>

        <Surface
          tokens={tokens}
          style={{
            padding: 38,
            opacity: enter,
            transform: `translateY(${(1 - enter) * 28}px)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <h2 style={{ margin: 0, fontFamily: serif, fontSize: 45 }}>
              {copy.breakdown}
            </h2>
            <span
              style={{ color: tokens.muted, fontFamily: sans, fontSize: 18 }}
            >
              {selected.displayName}
            </span>
          </div>
          <div
            style={{
              marginTop: 37,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '25px 38px',
            }}
          >
            {selected.dimensions.map(({ dimension, score }, index) => {
              const width = interpolate(
                frame,
                [18 + index * 3, 63 + index * 3],
                [0, score ?? 0],
                {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                  easing: Easing.out(Easing.cubic),
                },
              );
              return (
                <div key={dimension}>
                  <div
                    style={{
                      marginBottom: 11,
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: sans,
                    }}
                  >
                    <span style={{ fontSize: 19, fontWeight: 700 }}>
                      {copy.dimensions[dimension]}
                    </span>
                    <strong
                      style={{
                        color: tokens.accentStrong,
                        fontFamily: serif,
                        fontSize: 25,
                      }}
                    >
                      {formatVideoScore(score)}
                    </strong>
                  </div>
                  <div
                    style={{
                      height: 12,
                      borderRadius: 99,
                      background: tokens.line,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${width}%`,
                        height: '100%',
                        borderRadius: 99,
                        background:
                          index % 3 === 2 ? tokens.comparison : tokens.accent,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 54,
              paddingTop: 26,
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: `2px solid ${tokens.line}`,
              fontFamily: sans,
            }}
          >
            {isPreview ? <PreviewBadge copy={copy} tokens={tokens} /> : null}
            <span
              style={{ alignSelf: 'center', color: tokens.muted, fontSize: 17 }}
            >
              {isPreview ? copy.disclaimer : copy.formal}
            </span>
          </div>
        </Surface>
      </div>
    </SceneBase>
  );
};

export const LlmBenchWeeklyVideo = (inputProps: LlmBenchVideoProps) => {
  const props = validateVideoProps(inputProps);
  const tokens = getVideoTheme(props.theme);
  const copy = getVideoCopy(props.locale);
  const selected = props.snapshot.entries[props.selectedModelIndex];
  if (!selected) throw new Error('Selected model is missing from the snapshot');

  const fieldAverage = createFieldAverage(props.snapshot.entries);
  const isPreview = props.publicationMode === 'PREVIEW';

  return (
    <AbsoluteFill style={{ background: tokens.canvas }}>
      {scenes.map((scene) => (
        <Sequence
          key={scene.id}
          name={scene.id}
          from={scene.from}
          durationInFrames={scene.to - scene.from + 1}
        >
          {scene.id === 'intro' ? (
            <IntroScene
              copy={copy}
              tokens={tokens}
              isPreview={isPreview}
              editionDate={props.snapshot.editionDate}
            />
          ) : null}
          {scene.id === 'profile' ? (
            <ProfileScene
              copy={copy}
              tokens={tokens}
              entry={selected}
              fieldAverage={fieldAverage}
              isPreview={isPreview}
              editionDate={props.snapshot.editionDate}
            />
          ) : null}
          {scene.id === 'ranking' ? (
            <RankingScene
              copy={copy}
              tokens={tokens}
              snapshot={props.snapshot}
              selected={selected}
              isPreview={isPreview}
              editionDate={props.snapshot.editionDate}
            />
          ) : null}
          {scene.id === 'evidence' ? (
            <EvidenceScene
              copy={copy}
              tokens={tokens}
              isPreview={isPreview}
              snapshotSha256={props.snapshotContentSha256}
              modelCount={props.snapshot.entries.length}
              sourceCount={props.snapshot.sourceSnapshotIds.length}
              editionDate={props.snapshot.editionDate}
            />
          ) : null}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
