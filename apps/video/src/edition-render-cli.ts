import { mkdir, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import {
  completeVideoJob,
  createDatabase,
  getEditionForVideo,
  queueFormalVideoJob,
  shouldPersistVideoJob,
  startVideoJob,
} from '@llm-bench/db';

import { createVideoArtifactBundle } from './artifacts';
import {
  createEditionRenderPlan,
  parseEditionRenderArguments,
} from './edition-render';
import {
  createRemotionInvocation,
  createRenderOutputContext,
  createRenderOutputLayout,
  createVideoRenderLog,
  runRemotionInvocation,
  sha256File,
  type RenderOutputContext,
  type RenderOutputLayout,
} from './render-runner';

const packageDirectory = resolve(import.meta.dirname, '..');
const projectDirectory = resolve(packageDirectory, '../..');
const outputRoot = resolve(projectDirectory, 'output');

const toProjectPath = (path: string): string =>
  relative(projectDirectory, path).replaceAll('\\', '/');

const describeError = (error: unknown): string =>
  error instanceof Error && error.message.length > 0
    ? `${error.name}: ${error.message}`
    : String(error);

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

const command = parseEditionRenderArguments(process.argv.slice(2));
const { db, pool } = createDatabase();
let context: RenderOutputContext | undefined;
let layout: RenderOutputLayout | undefined;
let jobId: string | null = null;
let jobStarted = false;
const startedAt = new Date().toISOString();

try {
  const edition = await getEditionForVideo(db, command.selector);
  if (!edition) throw new Error('Requested weekly edition was not found');
  const plan = createEditionRenderPlan(edition, command);
  context = createRenderOutputContext(plan);
  layout = createRenderOutputLayout(outputRoot, context);
  const bundle = createVideoArtifactBundle(plan.props, {
    weeklyEditionId: edition.id,
    publicationMode: edition.publicationMode,
    snapshotContentSha256: plan.snapshotContentSha256,
    topN: plan.topN,
  });

  await mkdir(layout.directory, { recursive: true });
  await Promise.all([
    writeJson(layout.propsPath, plan.props),
    writeJson(layout.metadataPath, bundle.manifest),
    writeFile(layout.rankingCsvPath, bundle.rankingCsv, 'utf8'),
  ]);

  if (shouldPersistVideoJob(edition.publicationMode)) {
    jobId = await queueFormalVideoJob(db, {
      weeklyEditionId: edition.id,
      themePresetSlug: plan.themePresetSlug,
      locale: plan.props.locale,
      compositionId: bundle.manifest.compositionId,
      inputSnapshotSha256: bundle.manifest.inputPropsSha256,
    });
    await startVideoJob(db, jobId, new Date(startedAt));
    jobStarted = true;
  }

  const pnpmCliPath = process.env.npm_execpath;
  if (!pnpmCliPath) {
    throw new Error(
      'npm_execpath is required for a shell-free Remotion render',
    );
  }
  await runRemotionInvocation(
    createRemotionInvocation({
      nodePath: process.execPath,
      pnpmCliPath,
      packageDirectory,
      media: plan.media,
      propsPath: layout.propsPath,
      outputPath: layout.outputPath,
    }),
  );
  const outputSha256 = await sha256File(layout.outputPath);
  const completedAt = new Date().toISOString();

  if (jobId) {
    await completeVideoJob(db, jobId, {
      status: 'SUCCEEDED',
      outputPath: toProjectPath(layout.outputPath),
      outputSha256,
      completedAt: new Date(completedAt),
    });
  }

  const renderLog = createVideoRenderLog({
    ...context,
    jobId,
    status: 'SUCCEEDED',
    startedAt,
    completedAt,
    outputPath: toProjectPath(layout.outputPath),
    outputSha256,
    metadataPath: toProjectPath(layout.metadataPath),
    rankingCsvPath: toProjectPath(layout.rankingCsvPath),
  });
  await writeJson(layout.renderLogPath, renderLog);
  console.info(
    JSON.stringify(
      {
        editionId: edition.id,
        snapshotId: edition.snapshot.id,
        publicationMode: edition.publicationMode,
        jobId,
        outputPath: toProjectPath(layout.outputPath),
        outputSha256,
        renderLogPath: toProjectPath(layout.renderLogPath),
      },
      null,
      2,
    ),
  );
} catch (error) {
  const completedAt = new Date().toISOString();
  const errorSummary = describeError(error);
  if (jobId && jobStarted) {
    try {
      await completeVideoJob(db, jobId, {
        status: 'FAILED',
        errorSummary,
        completedAt: new Date(completedAt),
      });
    } catch {
      // Preserve the original renderer or artifact failure.
    }
  }
  if (context && layout) {
    const renderLog = createVideoRenderLog({
      ...context,
      jobId,
      status: 'FAILED',
      startedAt,
      completedAt,
      errorSummary,
      metadataPath: toProjectPath(layout.metadataPath),
      rankingCsvPath: toProjectPath(layout.rankingCsvPath),
    });
    await mkdir(layout.directory, { recursive: true });
    await writeJson(layout.renderLogPath, renderLog);
  }
  throw error;
} finally {
  await pool.end();
}
