import {
  presetJson,
  presetMarkdown,
  projectPresets,
} from '../../../../lib/agent-surfaces';
import { loadProductVersion } from '../../../../lib/load-product-version';

export const dynamic = 'force-static';
export const dynamicParams = false;

const FORMATS = {
  md: 'text/markdown; charset=utf-8',
  json: 'application/json; charset=utf-8',
} as const;

export function generateStaticParams() {
  return loadProductVersion().product.presets.flatMap(({ id }) =>
    Object.keys(FORMATS).map((format) => ({ preset: `${id}.${format}` })),
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ preset: string }> },
) {
  const { preset: file } = await params;
  const split = file.lastIndexOf('.');
  const format = file.slice(split + 1);
  const { benchmarkDimensions, product } = loadProductVersion();
  const presets = projectPresets(product, benchmarkDimensions);
  const projection = presets.find(
    ({ preset }) => preset.id === file.slice(0, split),
  );
  if (!projection || (format !== 'md' && format !== 'json')) {
    return new Response('Preset not found', { status: 404 });
  }
  return new Response(
    format === 'md'
      ? presetMarkdown(projection, presets)
      : presetJson(projection),
    { headers: { 'content-type': FORMATS[format] } },
  );
}
