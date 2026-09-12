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
  buildCommonComparison,
  comparisonOptions,
} from '../lib/common-benchmarks';
import { CommonBenchmarkTable } from './common-benchmark-table';
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
  const [commonMode, setCommonMode] = useState(false);
  const [pinnedProfileIds, setPinnedProfileIds] = useState<string[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<
    Record<string, string>
  >({});

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
  const options = useMemo(
    () => comparisonOptions(product, benchmarkDimensions),
    [product, benchmarkDimensions],
  );
  const comparison = useMemo(
    () =>
      buildCommonComparison(
        product,
        checkedModelIds,
        selectedProfiles,
        benchmarkDimensions,
        options,
        pinnedProfileIds,
      ),
    [
      product,
      checkedModelIds,
      selectedProfiles,
      benchmarkDimensions,
      options,
      pinnedProfileIds,
    ],
  );
  const updateCheckedModels: React.Dispatch<React.SetStateAction<string[]>> = (
    value,
  ) => {
    if (!commonMode) {
      setSelectedProfiles(
        Object.fromEntries(
          representatives.map((row) => [
            row.modelId,
            selectedProfiles[row.modelId] ?? row.profileId,
          ]),
        ),
      );
    }
    setCommonMode(true);
    const nextIds =
      typeof value === 'function' ? value(checkedModelIds) : value;
    setCheckedModelIds(nextIds);
    setPinnedProfileIds((ids) =>
      ids.filter((id) =>
        product.profiles.some(
          (p) => p.id === id && nextIds.includes(p.modelId),
        ),
      ),
    );
  };
  const pinProfile = (modelId: string, profileId: string) => {
    const next = product.profiles.find(
      (p) =>
        p.modelId === modelId &&
        p.id !== profileId &&
        !pinnedProfileIds.includes(p.id),
    );
    if (!next || pinnedProfileIds.includes(profileId)) return;
    const defaults = commonMode
      ? selectedProfiles
      : Object.fromEntries(
          representatives.map((row) => [
            row.modelId,
            selectedProfiles[row.modelId] ?? row.profileId,
          ]),
        );
    setSelectedProfiles({ ...defaults, [modelId]: next.id });
    setPinnedProfileIds((ids) => [...ids, profileId]);
    setCommonMode(true);
  };
  const selectPreset = (id: string) => {
    setCommonMode(false);
    setPinnedProfileIds([]);
    setPresetId(id);
    setCheckedModelIds(defaultCheckedIds);
  };

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
          product={commonMode ? comparison.product : visibleProduct}
          pickerProduct={product}
          rows={commonMode ? comparison.product.leaderboard : rows}
          representatives={options}
          checkedModelIds={checkedModelIds}
          setCheckedModelIds={updateCheckedModels}
          onResetModels={() => selectPreset(presetId)}
          selectedProfiles={selectedProfiles}
          onSelectedProfileChange={(modelId, profileId) =>
            setSelectedProfiles((current) => ({
              ...current,
              [modelId]: profileId,
            }))
          }
          commonMode={commonMode}
          pinnedProfileIds={pinnedProfileIds}
          onPinProfile={pinProfile}
          onRemovePinnedProfile={(id) =>
            setPinnedProfileIds((ids) => ids.filter((p) => p !== id))
          }
          benchmarkDimensions={benchmarkDimensions}
          preset={commonMode ? comparison.product.activePreset : activePreset}
          controlPreset={activePreset}
          onSelectPreset={selectPreset}
          initialExpandedModelIds={initialExpandedModelIds}
          developerMode={developerMode}
        />
        {commonMode ? <CommonBenchmarkTable comparison={comparison} /> : null}

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

        <RadarChart
          product={commonMode ? comparison.product : product}
          comparisonProduct={commonMode ? comparison.product : visibleProduct}
          fixedProfileIds={
            commonMode
              ? comparison.profiles.map((profile) => profile.id)
              : undefined
          }
        />

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
