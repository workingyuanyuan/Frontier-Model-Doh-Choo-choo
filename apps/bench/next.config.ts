import type { NextConfig } from 'next';

/**
 * The dashboard is a single prerendered page with no server behaviour, so it
 * ships as a static export. GitHub Pages serves a project site from a
 * subpath, which the workflow passes in; local builds and e2e leave it empty.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  allowedDevOrigins: ['127.0.0.1'],
  ...(basePath === '' ? {} : { basePath, assetPrefix: basePath }),
};

export default nextConfig;
