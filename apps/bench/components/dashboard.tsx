'use client';

import type { DimensionId, ProductVersion } from '@llm-bench/benchmark-data';
import { useEffect, useMemo, useState } from 'react';

import { CostChart } from './cost-chart';
import { DeveloperModelList } from './developer-model-list';
import { PartialCoverageList } from './partial-coverage-list';
import { Leaderboard } from './leaderboard';
import { RadarChart } from './radar-chart';
import { VersionHeader } from './version-header';
import {
  getDeveloperModelRows,
  getPartialCoverageRows,
  getRepresentativeRows,
  isMainEligibleRow,
  withActivePreset,
  type PresetProductVersion,
} from '../lib/view-model';

const PRESET_QUERY_KEY = 'preset';

const formatGeneratedAt = (generatedAt: string): string =>
  new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(generatedAt));

export function Dashboard({
  benchmarkDimensions,
  product: rawProduct,
  initialExpandedModelIds,
  initialPresetId,
  initialDeveloperMode,
}: {
  benchmarkDimensions: Record<string, DimensionId>;
  product: ProductVersion;
  initialExpandedModelIds?: string[] | undefined;
  initialPresetId?: string | undefined;
  initialDeveloperMode?: boolean | undefined;
}) {
  const [developerMode, setDeveloperMode] = useState(
    initialDeveloperMode ?? false,
  );
  const [presetId, setPresetId] = useState(
    initialPresetId ?? rawProduct.defaultPresetId,
  );

  // Ruling D-N10-5: the preset lives in a query parameter, not a route. Read
  // once on mount so a shared link opens on the right scores, and write with
  // replaceState so switching presets does not fill the back button.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get(
      PRESET_QUERY_KEY,
    );
    if (requested && rawProduct.presets.some(({ id }) => id === requested)) {
      setPresetId(requested);
    }
  }, [rawProduct.presets]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (presetId === rawProduct.defaultPresetId) {
      url.searchParams.delete(PRESET_QUERY_KEY);
    } else {
      url.searchParams.set(PRESET_QUERY_KEY, presetId);
    }
    window.history.replaceState(null, '', url);
  }, [presetId, rawProduct.defaultPresetId]);

  // The preset is the scoring basis (R1): resolved once here, so every gate,
  // chart and table below reads the same set of scores.
  const product = useMemo(
    () => withActivePreset(rawProduct, presetId),
    [presetId, rawProduct],
  );
  const activePreset = product.activePreset;
  const developerRows = useMemo(
    () => getDeveloperModelRows(product, activePreset),
    [activePreset, product],
  );
  const partialCoverageRows = useMemo(
    () => getPartialCoverageRows(product),
    [product],
  );
  const mainProfileIds = useMemo(
    () =>
      new Set(
        product.leaderboard
          .filter((row) => isMainEligibleRow(product, row, activePreset))
          .map(({ profileId }) => profileId),
      ),
    [activePreset, product],
  );
  const visibleModelIds = useMemo(
    () =>
      new Set(
        product.leaderboard
          .filter((row) => mainProfileIds.has(row.profileId))
          .map((row) => row.modelId),
      ),
    [mainProfileIds, product.leaderboard],
  );
  const visibleProfileIds = useMemo(
    () =>
      new Set(
        product.profiles
          .filter(({ id }) => mainProfileIds.has(id))
          .map(({ id }) => id),
      ),
    [mainProfileIds, product.profiles],
  );
  const visibleProduct = useMemo<PresetProductVersion>(
    () => ({
      ...product,
      frontier: product.frontier.filter(({ modelId }) =>
        visibleModelIds.has(modelId),
      ),
      profiles: product.profiles.filter(({ id }) => mainProfileIds.has(id)),
      leaderboard: product.leaderboard.filter(({ profileId }) =>
        mainProfileIds.has(profileId),
      ),
      costs: product.costs.filter(({ profileId }) =>
        visibleProfileIds.has(profileId),
      ),
      evidence: product.evidence.filter(
        ({ model }) =>
          model.canonicalModelId !== null &&
          visibleModelIds.has(model.canonicalModelId),
      ),
    }),
    [mainProfileIds, product, visibleModelIds, visibleProfileIds],
  );
  const representatives = useMemo(
    () => getRepresentativeRows(visibleProduct),
    [visibleProduct],
  );

  const defaultCheckedIds = useMemo(
    () => representatives.map((r) => r.modelId),
    [representatives],
  );
  const [checkedModelIds, setCheckedModelIds] =
    useState<string[]>(defaultCheckedIds);

  const rows = useMemo(() => {
    return representatives.filter((row) =>
      checkedModelIds.includes(row.modelId),
    );
  }, [representatives, checkedModelIds]);

  const generated = formatGeneratedAt(product.generatedAt);

  useEffect(() => {
    setCheckedModelIds(defaultCheckedIds);
  }, [defaultCheckedIds]);

  return (
    <div id="top">
      <VersionHeader
        developerMode={developerMode}
        onDeveloperModeChange={setDeveloperMode}
      />
      <main className="page-shell">
        <section className="intro" aria-labelledby="page-title">
          <h1 id="page-title">Leaderboard</h1>
        </section>

        <Leaderboard
          product={visibleProduct}
          rows={rows}
          representatives={representatives}
          checkedModelIds={checkedModelIds}
          setCheckedModelIds={setCheckedModelIds}
          benchmarkDimensions={benchmarkDimensions}
          preset={activePreset}
          onSelectPreset={setPresetId}
          initialExpandedModelIds={initialExpandedModelIds}
          developerMode={developerMode}
        />

        {developerMode ? (
          <>
            <PartialCoverageList rows={partialCoverageRows} />
            <DeveloperModelList
              rows={developerRows}
              product={product}
              benchmarkDimensions={benchmarkDimensions}
              preset={activePreset}
            />
          </>
        ) : null}

        <RadarChart product={product} comparisonProduct={visibleProduct} />

        <CostChart
          defaultProduct={visibleProduct}
          advancedProduct={product}
          developerMode={developerMode}
        />
      </main>
      <footer className="site-footer">
        <span>FM-DCC</span>
        <span className="footer-version-meta">
          <span>Version {product.versionId}</span>
          <span>Generated {generated} UTC</span>
        </span>
      </footer>
    </div>
  );
}
