import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

import {
  EvidenceRecordSchema,
  sha256,
  type CandidateResult,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';

const EXTENSIONS: Record<string, string> = {
  'application/json': '.json',
  'application/javascript': '.js',
  'text/javascript': '.js',
  'application/zip': '.zip',
  'application/octet-stream': '.bin',
  'application/pdf': '.pdf',
  'text/html': '.html',
  'text/csv': '.csv',
  'text/plain': '.txt',
  'text/markdown': '.md',
};

const extensionForMediaType = (mediaType: string): string => {
  const extension = EXTENSIONS[mediaType];
  if (!extension) {
    throw new Error(`unsupported artifact media type: ${mediaType}`);
  }
  return extension;
};

const ensureInside = (root: string, path: string): void => {
  const resolvedRoot = resolve(root);
  const resolvedPath = resolve(path);
  if (
    resolvedPath !== resolvedRoot &&
    !resolvedPath.startsWith(`${resolvedRoot}${sep}`)
  ) {
    throw new Error('artifact path escapes its configured root');
  }
};

export const buildArtifactRecord = (
  bytes: Uint8Array,
  mediaType: string,
  artifactPath: string,
  overrides: Partial<
    Pick<
      EvidenceRecord,
      | 'sourceId'
      | 'retrievedAt'
      | 'requestUrl'
      | 'finalUrl'
      | 'method'
      | 'metadata'
    >
  > = {},
): EvidenceRecord => {
  const digest = sha256(bytes);
  return EvidenceRecordSchema.parse({
    schemaVersion: 'evidence-record-v1',
    id: digest,
    sourceId: overrides.sourceId ?? 'local-fixture',
    retrievedAt: overrides.retrievedAt ?? '1970-01-01T00:00:00.000Z',
    requestUrl: overrides.requestUrl ?? 'https://example.test/evidence',
    finalUrl: overrides.finalUrl ?? 'https://example.test/evidence',
    mediaType,
    byteLength: bytes.byteLength,
    sha256: digest,
    artifactPath,
    method: overrides.method ?? 'MANUAL',
    metadata: overrides.metadata ?? {},
  });
};

export const verifyArtifactRecord = (
  record: EvidenceRecord,
  bytes: Uint8Array,
): void => {
  if (record.sha256 !== sha256(bytes)) {
    throw new Error('artifact hash does not match its evidence record');
  }
  if (record.byteLength !== bytes.byteLength) {
    throw new Error('artifact byte length does not match its evidence record');
  }
};

export const writeContentAddressedArtifact = async (
  root: string,
  bytes: Uint8Array,
  mediaType: string,
): Promise<{ path: string; record: EvidenceRecord }> => {
  const digest = sha256(bytes).slice('sha256:'.length);
  const extension = extensionForMediaType(mediaType);
  const path = join(root, digest.slice(0, 2), `${digest}${extension}`);
  ensureInside(root, path);
  await mkdir(join(root, digest.slice(0, 2)), { recursive: true });

  try {
    const existing = await readFile(path);
    if (sha256(existing) !== `sha256:${digest}`) {
      throw new Error('existing content-addressed artifact is corrupt');
    }
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      await writeFile(path, bytes, { flag: 'wx' });
    } else {
      throw error;
    }
  }

  const relativePath = path
    .slice(resolve(root).length)
    .replace(/^[/\\]+/u, '')
    .replaceAll('\\', '/');
  const record = buildArtifactRecord(bytes, mediaType, relativePath);
  if (extname(path) !== extension) {
    throw new Error('artifact extension does not match its media type');
  }
  return { path, record };
};

export interface CompletenessInput {
  sourceId: string;
  expectedVisibleRows: number | null;
  extractedRows: number;
  candidateRows: number;
  expectedPages: number | null;
  processedPages: number;
  structuredVisualConflict: boolean;
}

export interface CompletenessIssue {
  code:
    | 'VISIBLE_COUNT_UNKNOWN'
    | 'VISIBLE_ROW_MISMATCH'
    | 'PAGINATION_INCOMPLETE'
    | 'STRUCTURED_VISUAL_CONFLICT'
    | 'NO_CANDIDATE_ROWS';
  message: string;
}

export interface CompletenessReport extends CompletenessInput {
  status: 'FULL' | 'PARTIAL_SOURCE' | 'REVIEW_REQUIRED';
  issues: CompletenessIssue[];
}

export const buildCompletenessReport = (
  input: CompletenessInput,
): CompletenessReport => {
  const issues: CompletenessIssue[] = [];

  if (input.expectedVisibleRows === null) {
    issues.push({
      code: 'VISIBLE_COUNT_UNKNOWN',
      message: 'The visible source row count could not be established.',
    });
  } else if (input.extractedRows !== input.expectedVisibleRows) {
    issues.push({
      code: 'VISIBLE_ROW_MISMATCH',
      message: `Extracted ${input.extractedRows} rows but the source displayed ${input.expectedVisibleRows}.`,
    });
  }

  if (
    input.expectedPages !== null &&
    input.processedPages < input.expectedPages
  ) {
    issues.push({
      code: 'PAGINATION_INCOMPLETE',
      message: `Processed ${input.processedPages} of ${input.expectedPages} pages.`,
    });
  }

  if (input.structuredVisualConflict) {
    issues.push({
      code: 'STRUCTURED_VISUAL_CONFLICT',
      message: 'Structured data conflicts with the visible source page.',
    });
  }

  if (input.extractedRows > 0 && input.candidateRows === 0) {
    issues.push({
      code: 'NO_CANDIDATE_ROWS',
      message: 'Rows were extracted but no Candidate Results were produced.',
    });
  }

  const reviewRequired = issues.some(({ code }) =>
    ['STRUCTURED_VISUAL_CONFLICT', 'NO_CANDIDATE_ROWS'].includes(code),
  );

  return {
    ...input,
    status: reviewRequired
      ? 'REVIEW_REQUIRED'
      : issues.length > 0
        ? 'PARTIAL_SOURCE'
        : 'FULL',
    issues,
  };
};

export const findMissingEvidenceIds = (
  candidates: CandidateResult[],
  evidence: EvidenceRecord[],
): string[] => {
  const available = new Set(evidence.map(({ id }) => id));
  return [
    ...new Set(
      candidates.flatMap(({ evidenceIds }) =>
        evidenceIds.filter((id) => !available.has(id)),
      ),
    ),
  ].sort();
};

export const renderCompletenessMarkdown = (
  report: CompletenessReport,
): string => {
  const value = (count: number | null): string =>
    count === null ? 'Unknown' : String(count);
  const issues =
    report.issues.length === 0
      ? '- None'
      : report.issues
          .map(({ code, message }) => `- \`${code}\`: ${message}`)
          .join('\n');

  return [
    `# ${report.sourceId} acquisition validation`,
    '',
    '| Check | Value |',
    '|---|---:|',
    `| Status | ${report.status} |`,
    `| Visible rows | ${value(report.expectedVisibleRows)} |`,
    `| Extracted rows | ${report.extractedRows} |`,
    `| Candidate rows | ${report.candidateRows} |`,
    `| Expected pages | ${value(report.expectedPages)} |`,
    `| Processed pages | ${report.processedPages} |`,
    '',
    '## Issues',
    '',
    issues,
    '',
  ].join('\n');
};

export { materializeEpoch } from './epoch-materializer.js';
export { materializeArtificialAnalysis } from './artificial-analysis-materializer.js';
export {
  extractLiveBenchMetadata,
  materializeLiveBench,
} from './livebench-materializer.js';
export { materializeDeepSwe } from './deepswe-materializer.js';
export {
  FRONTIER_CODE_DATA_URL,
  FRONTIER_CODE_PAGE_URL,
  extractFrontierCodeTopTen,
  materializeFrontierCode,
} from './frontier-code-materializer.js';
export {
  ARTIFICIAL_ANALYSIS_EVALUATION_SLUGS,
  compareArtificialAnalysisApi,
  decodeArtificialAnalysisRsc,
  extractArtificialAnalysisRscRows,
  isArtificialAnalysisActiveRow,
  isArtificialAnalysisValuePresent,
  materializeArtificialAnalysisRsc,
} from './artificial-analysis-rsc.js';
export {
  materializeArtificialAnalysisCosts,
  materializeDeepSweCosts,
  materializeLiveBenchCosts,
} from './pricing-materializers.js';
