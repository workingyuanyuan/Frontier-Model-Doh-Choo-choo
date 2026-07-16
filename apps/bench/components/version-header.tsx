import type { ProductVersion } from '@llm-bench/benchmark-data';

import type { ProductChannel } from '../lib/ui-contract';

const shortVersion = (versionId: string) =>
  `${versionId.slice(7, 15)}…${versionId.slice(-6)}`;

export function VersionHeader({
  product,
  channel,
}: {
  product: ProductVersion;
  channel: ProductChannel;
}) {
  const generated = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(product.generatedAt));

  return (
    <header className="site-header">
      <div>
        <a className="brand" href="#top" aria-label="LLM Bench dashboard home">
          <span className="brand-mark" aria-hidden="true">
            LB
          </span>
          <span>
            <strong>LLM Bench</strong>
            <small>Frontier model intelligence</small>
          </span>
        </a>
      </div>
      <dl className="version-meta" aria-label="Dataset version">
        <div>
          <dt>Channel</dt>
          <dd>
            <span className={`state-badge state-${channel.toLowerCase()}`}>
              {channel}
            </span>
          </dd>
        </div>
        <div>
          <dt>Version</dt>
          <dd title={product.versionId}>{shortVersion(product.versionId)}</dd>
        </div>
        <div>
          <dt>Generated</dt>
          <dd>{generated} UTC</dd>
        </div>
      </dl>
    </header>
  );
}
