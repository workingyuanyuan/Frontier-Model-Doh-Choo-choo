import { presetMarkdown } from '../../../../lib/agent-surfaces';
import { loadProductVersion } from '../../../../lib/load-product-version';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return loadProductVersion().product.presets.map(({ id }) => ({
    preset: `${id}.md`,
  }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ preset: string }> },
) {
  const { preset } = await params;
  const { benchmarkDimensions, product } = loadProductVersion();
  const markdown = preset.endsWith('.md')
    ? presetMarkdown(product, preset.slice(0, -3), benchmarkDimensions)
    : null;
  if (markdown === null) {
    return new Response('Preset not found', { status: 404 });
  }
  return new Response(markdown, {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  });
}
