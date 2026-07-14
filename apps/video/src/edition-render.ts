import {
  ActiveEditionSchema,
  DetailSlugSchema,
  type ActiveEdition,
} from '@llm-bench/contracts';
import * as z from 'zod';

import type { LlmBenchVideoProps, VideoLocale, VideoTheme } from './props';

const uuidV7 = z.uuidv7();

export type EditionRenderSelector =
  | { readonly editionId: string; readonly snapshotId?: never }
  | { readonly editionId?: never; readonly snapshotId: string };

export type EditionRenderMedia = 'poster' | 'video';

export interface EditionRenderCommand {
  readonly selector: EditionRenderSelector;
  readonly locale: VideoLocale;
  readonly theme: VideoTheme;
  readonly topN: number;
  readonly selectedModelSlug: string | undefined;
  readonly media: EditionRenderMedia;
}

export interface EditionRenderPlan {
  readonly edition: ActiveEdition;
  readonly props: LlmBenchVideoProps;
  readonly themePresetSlug: 'editorial-light' | 'studio-light';
  readonly snapshotContentSha256: string;
  readonly media: EditionRenderMedia;
  readonly topN: number;
}

function readValue(arguments_: readonly string[], index: number): string {
  const value = arguments_[index + 1];
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`${arguments_[index]} requires a value`);
  }
  return value;
}

export function parseEditionRenderArguments(
  arguments_: readonly string[],
): EditionRenderCommand {
  const flags = arguments_[0] === '--' ? arguments_.slice(1) : arguments_;
  let editionId: string | undefined;
  let snapshotId: string | undefined;
  let locale: VideoLocale = 'zh-TW';
  let theme: VideoTheme = 'editorial';
  let topN = 5;
  let selectedModelSlug: string | undefined;
  let media: EditionRenderMedia = 'poster';

  for (let index = 0; index < flags.length; index += 2) {
    const flag = flags[index];
    const value = readValue(flags, index);
    switch (flag) {
      case '--edition':
        editionId = uuidV7.parse(value);
        break;
      case '--snapshot':
        snapshotId = uuidV7.parse(value);
        break;
      case '--locale':
        if (value !== 'zh-TW' && value !== 'en') {
          throw new Error('Video locale must be zh-TW or en');
        }
        locale = value;
        break;
      case '--theme':
        if (value !== 'editorial' && value !== 'studio') {
          throw new Error('Video theme must be editorial or studio');
        }
        theme = value;
        break;
      case '--top': {
        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
          throw new Error('Video Top-N must be an integer from one to five');
        }
        topN = parsed;
        break;
      }
      case '--model':
        selectedModelSlug = DetailSlugSchema.parse(value);
        break;
      case '--media':
        if (value !== 'poster' && value !== 'video') {
          throw new Error('Video media must be poster or video');
        }
        media = value;
        break;
      default:
        throw new Error(`Unknown video render argument: ${String(flag)}`);
    }
  }

  if ((editionId === undefined) === (snapshotId === undefined)) {
    throw new Error('Specify exactly one of --edition or --snapshot');
  }

  return {
    selector: editionId ? { editionId } : { snapshotId: snapshotId! },
    locale,
    theme,
    topN,
    selectedModelSlug,
    media,
  };
}

export function createEditionRenderPlan(
  inputEdition: ActiveEdition,
  command: EditionRenderCommand,
): EditionRenderPlan {
  const edition = ActiveEditionSchema.parse(inputEdition);
  if (
    ('editionId' in command.selector &&
      command.selector.editionId !== edition.id) ||
    ('snapshotId' in command.selector &&
      command.selector.snapshotId !== edition.snapshot.id)
  ) {
    throw new Error('Resolved edition does not match the requested snapshot');
  }

  const entries = edition.snapshot.entries.slice(0, command.topN);
  if (entries.length === 0) {
    throw new Error('Edition snapshot has no entries to render');
  }
  const selectedModelIndex = command.selectedModelSlug
    ? entries.findIndex(({ slug }) => slug === command.selectedModelSlug)
    : 0;
  if (selectedModelIndex < 0) {
    throw new Error(
      'Selected model must be present within the requested Top-N',
    );
  }

  return {
    edition,
    props: {
      snapshot: { ...edition.snapshot, entries },
      locale: command.locale,
      theme: command.theme,
      publicationMode: edition.publicationMode,
      snapshotContentSha256: edition.snapshotSha256,
      selectedModelIndex,
    },
    themePresetSlug:
      command.theme === 'editorial' ? 'editorial-light' : 'studio-light',
    snapshotContentSha256: edition.snapshotSha256,
    media: command.media,
    topN: command.topN,
  };
}
