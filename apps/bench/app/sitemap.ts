import type { MetadataRoute } from 'next';

import { loadProductVersion } from '../lib/load-product-version';
import { presetPagePath, publicUrl } from '../lib/site-paths';

export const dynamic = 'force-static';

/**
 * Every HTML page of the export: the dashboard and one static page per
 * preset. The data files, Markdown and llms.txt are for agents and stay out.
 * All pages render the same product, so its generation time dates each one.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const { product } = loadProductVersion();
  const lastModified = product.generatedAt;
  return [
    { url: publicUrl(''), lastModified },
    ...product.presets.map(({ id }) => ({
      url: publicUrl(presetPagePath(id)),
      lastModified,
    })),
  ];
}
