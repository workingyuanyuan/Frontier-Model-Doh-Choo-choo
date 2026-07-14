import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { join, resolve } from 'node:path';

import { PublicationModeSchema, Sha256Schema } from '@llm-bench/contracts';
import * as z from 'zod';

import type { EditionRenderMedia, EditionRenderPlan } from './edition-render';

export interface RenderOutputContext {
  readonly weeklyEditionId: string;
  readonly snapshotId: string;
  readonly snapshotSha256: string;
  readonly editionDate: string;
  readonly publicationMode: 'FORMAL' | 'PREVIEW';
  readonly locale: 'zh-TW' | 'en';
  readonly theme: 'editorial' | 'studio';
  readonly topN: number;
  readonly selectedModelSlug: string;
  readonly media: EditionRenderMedia;
}

export interface RenderOutputLayout {
  readonly directory: string;
  readonly propsPath: string;
  readonly metadataPath: string;
  readonly rankingCsvPath: string;
  readonly outputPath: string;
  readonly renderLogPath: string;
}

export function createRenderOutputContext(
  plan: EditionRenderPlan,
): RenderOutputContext {
  const selected = plan.props.snapshot.entries[plan.props.selectedModelIndex];
  if (!selected) throw new Error('Selected model is missing from render plan');
  return {
    weeklyEditionId: plan.edition.id,
    snapshotId: plan.props.snapshot.id,
    snapshotSha256: plan.snapshotContentSha256,
    editionDate: plan.props.snapshot.editionDate,
    publicationMode: plan.edition.publicationMode,
    locale: plan.props.locale,
    theme: plan.props.theme,
    topN: plan.topN,
    selectedModelSlug: selected.slug,
    media: plan.media,
  };
}

export function createRenderOutputLayout(
  outputRoot: string,
  context: RenderOutputContext,
): RenderOutputLayout {
  const suffix = `${context.locale}-${context.theme}-top${context.topN}-model-${context.selectedModelSlug}-${context.media}`;
  const directory = resolve(
    outputRoot,
    'video',
    context.editionDate,
    context.snapshotId,
    suffix,
  );
  const base = 'llm-bench-weekly';
  return {
    directory,
    propsPath: join(directory, `${base}.props.json`),
    metadataPath: join(directory, `${base}.metadata.json`),
    rankingCsvPath: join(directory, `${base}.ranking.csv`),
    outputPath: join(
      directory,
      `${base}.${context.media === 'poster' ? 'png' : 'mp4'}`,
    ),
    renderLogPath: join(directory, `${base}.render-log.json`),
  };
}

export interface RemotionInvocationInput {
  readonly nodePath: string;
  readonly pnpmCliPath: string;
  readonly packageDirectory: string;
  readonly media: EditionRenderMedia;
  readonly propsPath: string;
  readonly outputPath: string;
}

export interface RemotionInvocation {
  readonly command: string;
  readonly arguments: string[];
  readonly options: {
    readonly cwd: string;
    readonly shell: false;
    readonly stdio: 'inherit';
  };
}

export function createRemotionInvocation(
  input: RemotionInvocationInput,
): RemotionInvocation {
  const remotionCommand = input.media === 'poster' ? 'still' : 'render';
  const arguments_ = [
    input.pnpmCliPath,
    'exec',
    'remotion',
    remotionCommand,
    'src/index.ts',
    'LlmBenchWeekly',
    input.outputPath,
    `--props=${input.propsPath}`,
  ];
  if (input.media === 'poster') arguments_.push('--frame=240');

  return {
    command: input.nodePath,
    arguments: arguments_,
    options: {
      cwd: input.packageDirectory,
      shell: false,
      stdio: 'inherit',
    },
  };
}

export async function runRemotionInvocation(
  invocation: RemotionInvocation,
): Promise<void> {
  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn(
      invocation.command,
      invocation.arguments,
      invocation.options,
    );
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      reject(
        new Error(
          `Remotion exited with ${code === null ? `signal ${String(signal)}` : `code ${code}`}`,
        ),
      );
    });
  });
}

export async function sha256File(path: string): Promise<string> {
  const hash = createHash('sha256');
  await new Promise<void>((resolvePromise, reject) => {
    const stream = createReadStream(path);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.once('end', resolvePromise);
    stream.once('error', reject);
  });
  return hash.digest('hex');
}

const RenderLogBaseSchema = z.object({
  schemaVersion: z.literal(1),
  weeklyEditionId: z.uuidv7(),
  snapshotId: z.uuidv7(),
  snapshotSha256: Sha256Schema,
  editionDate: z.iso.date(),
  publicationMode: PublicationModeSchema,
  locale: z.enum(['zh-TW', 'en']),
  theme: z.enum(['editorial', 'studio']),
  topN: z.int().min(1).max(5),
  selectedModelSlug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
  media: z.enum(['poster', 'video']),
  jobId: z.uuidv7().nullable(),
  startedAt: z.iso.datetime(),
  completedAt: z.iso.datetime(),
  metadataPath: z.string().min(1),
  rankingCsvPath: z.string().min(1),
});

const VideoRenderLogSchema = z.discriminatedUnion('status', [
  RenderLogBaseSchema.extend({
    status: z.literal('SUCCEEDED'),
    outputPath: z.string().min(1),
    outputSha256: Sha256Schema,
  }),
  RenderLogBaseSchema.extend({
    status: z.literal('FAILED'),
    errorSummary: z.string().min(1).max(2_000),
  }),
]);

export type VideoRenderLog = z.infer<typeof VideoRenderLogSchema>;

type VideoRenderLogInput =
  | (RenderOutputContext & {
      readonly jobId: string | null;
      readonly status: 'SUCCEEDED';
      readonly startedAt: string;
      readonly completedAt: string;
      readonly outputPath: string;
      readonly outputSha256: string;
      readonly metadataPath: string;
      readonly rankingCsvPath: string;
    })
  | (RenderOutputContext & {
      readonly jobId: string | null;
      readonly status: 'FAILED';
      readonly startedAt: string;
      readonly completedAt: string;
      readonly errorSummary: string;
      readonly metadataPath: string;
      readonly rankingCsvPath: string;
    });

export function createVideoRenderLog(
  input: VideoRenderLogInput,
): VideoRenderLog {
  return VideoRenderLogSchema.parse({
    schemaVersion: 1,
    ...input,
    ...(input.status === 'FAILED'
      ? { errorSummary: input.errorSummary.slice(0, 2_000) }
      : {}),
  });
}
