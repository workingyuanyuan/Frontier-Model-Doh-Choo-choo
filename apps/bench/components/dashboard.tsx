'use client';

import type { ProductVersion } from '@llm-bench/benchmark-data';
import { useMemo, useState } from 'react';

import { CostChart } from './cost-chart';
import { EvidenceDetail } from './evidence-detail';
import { Leaderboard } from './leaderboard';
import { RadarChart } from './radar-chart';
import { VersionHeader } from './version-header';
import { UI_DIMENSION_IDS, type ProductChannel } from '../lib/ui-contract';
import {
  filterLeaderboard,
  getEvidenceForProfile,
  getProfilesForModel,
  getRepresentativeRows,
  profileById,
} from '../lib/view-model';

export function Dashboard({
  product,
  channel,
}: {
  product: ProductVersion;
  channel: ProductChannel;
}) {
  const representatives = getRepresentativeRows(product);
  const initialRow = representatives[0];
  const [query, setQuery] = useState('');
  const [selectedModelId, setSelectedModelId] = useState(
    initialRow?.modelId ?? '',
  );
  const [selectedProfileId, setSelectedProfileId] = useState(
    initialRow?.profileId ?? '',
  );

  const rows = useMemo(
    () => filterLeaderboard(product, query),
    [product, query],
  );
  const representativeRow = representatives.find(
    ({ modelId }) => modelId === selectedModelId,
  );
  const profiles = representativeRow
    ? getProfilesForModel(product, selectedModelId, representativeRow.profileId)
    : [];
  const selectedProfile =
    profileById(product, selectedProfileId) ?? profiles[0];
  const selectedResult = product.leaderboard.find(
    ({ profileId }) => profileId === selectedProfile?.id,
  );
  const dimensions =
    selectedResult?.dimensions ??
    UI_DIMENSION_IDS.map((dimension) => ({
      dimension,
      score: null,
      componentCount: 0,
    }));
  const evidence = selectedProfile
    ? getEvidenceForProfile(product, selectedProfile.id)
    : [];

  const selectModel = (modelId: string, profileId: string) => {
    setSelectedModelId(modelId);
    setSelectedProfileId(profileId);
  };

  return (
    <div id="top">
      <VersionHeader product={product} channel={channel} />
      <main className="page-shell">
        <section className="intro" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">Current frontier snapshot</p>
            <h1 id="page-title">Compare capability, cost, and evidence.</h1>
            <p>
              A source-backed view of frontier model profiles across eight
              capabilities. Scores with incomplete or vendor-only evidence stay
              visibly Estimated.
            </p>
          </div>
          {channel === 'DRAFT' ? (
            <aside className="draft-notice" aria-label="Draft dataset notice">
              <strong>DRAFT — review data</strong>
              <span>
                This preview is not published. Inspect profiles and evidence
                before approval.
              </span>
            </aside>
          ) : null}
        </section>

        <Leaderboard
          product={product}
          rows={rows}
          query={query}
          selectedModelId={selectedModelId}
          onQueryChange={setQuery}
          onSelect={selectModel}
        />

        {selectedProfile ? (
          <section
            className="profile-toolbar"
            aria-labelledby="profile-focus-title"
          >
            <div>
              <p className="eyebrow">Selected model</p>
              <h2 id="profile-focus-title">{selectedProfile.baseModelName}</h2>
            </div>
            <label>
              <span>Profile in focus</span>
              <select
                value={selectedProfile.id}
                onChange={(event) => setSelectedProfileId(event.target.value)}
              >
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.displayName}
                  </option>
                ))}
              </select>
            </label>
            <dl className="profile-facts">
              <div>
                <dt>Effort</dt>
                <dd>{selectedProfile.attributes.effort ?? 'Not published'}</dd>
              </div>
              <div>
                <dt>Tools</dt>
                <dd>
                  {selectedProfile.attributes.tools === null
                    ? 'Not published'
                    : selectedProfile.attributes.tools
                      ? 'Enabled'
                      : 'Disabled'}
                </dd>
              </div>
              <div>
                <dt>Context</dt>
                <dd>
                  {selectedProfile.attributes.contextWindowTokens
                    ? `${(selectedProfile.attributes.contextWindowTokens / 1000).toLocaleString()}k`
                    : 'Not published'}
                </dd>
              </div>
            </dl>
          </section>
        ) : null}

        <div className="analysis-grid">
          <RadarChart
            dimensions={dimensions}
            modelName={selectedProfile?.displayName ?? 'No model selected'}
          />
          <CostChart
            product={product}
            selectedProfileId={selectedProfile?.id ?? ''}
          />
        </div>

        {selectedProfile ? (
          <EvidenceDetail profile={selectedProfile} evidence={evidence} />
        ) : (
          <div className="panel empty-state" role="status">
            No model profile is available in this dataset.
          </div>
        )}
      </main>
      <footer className="site-footer">
        <span>LLM Bench</span>
        <span>Static, reviewable, source-backed.</span>
      </footer>
    </div>
  );
}
