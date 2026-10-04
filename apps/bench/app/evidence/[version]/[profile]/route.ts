import {
  buildProfileEvidencePayload,
  evidenceVersionPath,
} from '../../../../lib/dashboard-data';
import { loadProductVersion } from '../../../../lib/load-product-version';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  const { product } = loadProductVersion();
  return product.profiles.map(({ id }) => ({
    version: evidenceVersionPath(product.versionId),
    profile: `${id}.json`,
  }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ version: string; profile: string }> },
) {
  const { version, profile } = await params;
  const { product } = loadProductVersion();
  if (
    version !== evidenceVersionPath(product.versionId) ||
    !profile.endsWith('.json')
  ) {
    return Response.json({ error: 'Evidence not found' }, { status: 404 });
  }
  const payload = buildProfileEvidencePayload(product, profile.slice(0, -5));
  if (!payload) {
    return Response.json({ error: 'Evidence not found' }, { status: 404 });
  }
  return Response.json(payload);
}
