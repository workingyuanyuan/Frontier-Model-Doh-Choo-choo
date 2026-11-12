'use client';

import {
  unpackDashboardProduct,
  type DashboardPayload,
  type DashboardProduct as ProductVersion,
} from '../lib/dashboard-data';

import type { DimensionId } from '@llm-bench/benchmark-data';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';

import { CostChart, type ChartShortlist } from './cost-chart';
import { DeveloperModelList } from './developer-model-list';
import { PartialCoverageList } from './partial-coverage-list';
import { Leaderboard } from './leaderboard';
import { RadarChart } from './radar-chart';
import { VersionHeader } from './version-header';
import {
  buildCommonComparison,
  commonBenchmarkCountDeltas,
  comparisonIndex,
  comparisonOptions,
  profileBenchmarkCoverage,
} from '../lib/common-benchmarks';
import { CommonBenchmarkTable } from './common-benchmark-table';
import {
  initialSelection,
  selectionReducer,
  type SelectionContext,
} from '../lib/dashboard-selection';
import {
  getDeveloperModelRows,
  getPartialCoverageRows,
  getRepresentativeRows,
  isMainEligibleRow,
  withActivePreset,
  type PresetProductVersion,
} from '../lib/view-model';

const PRESET_QUERY_KEY = 'preset';
const MODELS_QUERY_KEY = 'models';
const EFFORTS_QUERY_KEY = 'efforts';
const PINS_QUERY_KEY = 'pins';
const DEVELOPER_QUERY_KEY = 'dev';

const NO_EFFORTS: Record<string, string> = {};
const NO_PINS: string[] = [];

const listParam = (params: URLSearchParams, key: string): string[] =>
  (params.get(key) ?? '').split(',').filter(Boolean);

const formatGeneratedAt = (generatedAt: string): string =>
  new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(generatedAt));

export function Dashboard({
  benchmarkDimensions,
  product: inputProduct,
  initialExpandedModelIds,
  initialPresetId,
  initialDeveloperMode,
}: {
  benchmarkDimensions: Record<string, DimensionId>;
  product: ProductVersion | DashboardPayload;
  initialExpandedModelIds?: string[] | undefined;
  initialPresetId?: string | undefined;
  initialDeveloperMode?: boolean | undefined;
}) {
  const rawProduct = useMemo(
    () =>
      inputProduct.schemaVersion === 'dashboard-payload-v1'
        ? unpackDashboardProduct(inputProduct)
        : inputProduct,
    [inputProduct],
  );
  const [developerMode, setDeveloperMode] = useState(
    initialDeveloperMode ?? false,
  );
  const [{ presetId, comparison: selected, hydration }, dispatch] = useReducer(
    selectionReducer,
    initialPresetId ?? rawProduct.defaultPresetId,
    initialSelection,
  );
  const commonMode = selected.mode === 'custom';
  const selectedProfiles = commonMode ? selected.efforts : NO_EFFORTS;
  const pinnedProfileIds = commonMode ? selected.pins : NO_PINS;

  // Ruling D-N10-5: the preset lives in a query parameter, not a route. Read
  // once on mount so a shared link opens on the right scores, and write with
  // replaceState so switching presets does not fill the back button. The
  // comparison (models, efforts, pins) and developer mode follow the same rule.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get(PRESET_QUERY_KEY);
    if (params.get(DEVELOPER_QUERY_KEY) === '1') setDeveloperMode(true);
    dispatch({
      type: 'hydrate',
      presetId:
        requested && rawProduct.presets.some(({ id }) => id === requested)
          ? requested
          : null,
      comparison: params.has(MODELS_QUERY_KEY)
        ? {
            models: listParam(params, MODELS_QUERY_KEY),
            efforts: listParam(params, EFFORTS_QUERY_KEY),
            pins: listParam(params, PINS_QUERY_KEY),
          }
        : null,
    });
  }, [rawProduct.presets]);

  // The preset is the scoring basis (R1): resolved once here, so every gate,
  // chart and table below reads the same set of scores.
  const product = useMemo(
    () => withActivePreset(rawProduct, presetId),
    [presetId, rawProduct],
  );
  const activePreset = product.activePreset;
  const developerRows = useMemo(
    () => (developerMode ? getDeveloperModelRows(product, activePreset) : []),
    [activePreset, product, developerMode],
  );
  const partialCoverageRows = useMemo(
    () => (developerMode ? getPartialCoverageRows(product) : []),
    [product, developerMode],
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
  const checkedModelIds = commonMode ? selected.modelIds : defaultCheckedIds;
  const options = useMemo(
    () => comparisonOptions(rawProduct, benchmarkDimensions),
    [rawProduct, benchmarkDimensions],
  );
  const index = useMemo(
    () => comparisonIndex(product, benchmarkDimensions),
    [product, benchmarkDimensions],
  );
  const representativeProfiles = useMemo(
    () =>
      Object.fromEntries(
        representatives.map((row) => [row.modelId, row.profileId]),
      ),
    [representatives],
  );
  const comparison = useMemo(
    () =>
      commonMode
        ? buildCommonComparison(
            product,
            checkedModelIds,
            selectedProfiles,
            benchmarkDimensions,
            options,
            pinnedProfileIds,
            index,
          )
        : null,
    [
      product,
      checkedModelIds,
      selectedProfiles,
      benchmarkDimensions,
      options,
      pinnedProfileIds,
      commonMode,
      index,
    ],
  );
  // Developer mode shows the common-benchmark table for the default selection
  // too. It is computed separately so the ranked table and charts keep the
  // preset's scores until the user edits the selection.
  const commonTable = useMemo(
    () =>
      comparison ??
      (developerMode
        ? buildCommonComparison(
            product,
            checkedModelIds,
            representativeProfiles,
            benchmarkDimensions,
            options,
            [],
            index,
          )
        : null),
    [
      comparison,
      developerMode,
      product,
      checkedModelIds,
      representativeProfiles,
      benchmarkDimensions,
      options,
      index,
    ],
  );
  // Measured against the selection the common-benchmark table shows.
  const effortDeltas = useMemo(
    () =>
      developerMode
        ? commonBenchmarkCountDeltas(
            product,
            checkedModelIds,
            commonMode ? selectedProfiles : representativeProfiles,
            benchmarkDimensions,
            options,
            commonMode ? pinnedProfileIds : [],
            index,
          )
        : undefined,
    [
      developerMode,
      product,
      checkedModelIds,
      commonMode,
      selectedProfiles,
      representativeProfiles,
      benchmarkDimensions,
      options,
      pinnedProfileIds,
      index,
    ],
  );
  const profileModelIds = useMemo(
    () => new Map(product.profiles.map((p) => [p.id, p.modelId])),
    [product.profiles],
  );
  const selectionContext = useMemo<SelectionContext>(
    () => ({
      defaultModelIds: defaultCheckedIds,
      representativeProfiles,
      profileModelIds,
    }),
    [defaultCheckedIds, representativeProfiles, profileModelIds],
  );
  const optionIds = useMemo(
    () => new Set(options.map(({ modelId }) => modelId)),
    [options],
  );
  const updateCheckedModels: React.Dispatch<React.SetStateAction<string[]>> = (
    update,
  ) => dispatch({ type: 'setModels', update, context: selectionContext });
  const selectPreset = (id: string) =>
    dispatch({ type: 'selectPreset', presetId: id });

  const coverage = useMemo(() => profileBenchmarkCoverage(index), [index]);
  const applyChartShortlist = useCallback(
    (models: ChartShortlist) => {
      dispatch({
        type: 'applyShortlist',
        models,
        optionIds,
        coverage,
        context: selectionContext,
      });
      document
        .getElementById('leaderboard-title')
        ?.scrollIntoView({ block: 'start' });
    },
    [coverage, optionIds, selectionContext],
  );

  // The shared comparison is resolved against the preset it was read with,
  // one render after that preset became active.
  useEffect(() => {
    if (hydration.phase === 'restoring')
      dispatch({
        type: 'restoreComparison',
        optionIds,
        context: selectionContext,
      });
  }, [hydration.phase, optionIds, selectionContext]);

  useEffect(() => {
    if (hydration.phase !== 'ready') return;
    const url = new URL(window.location.href);
    const { searchParams } = url;
    const setList = (key: string, values: string[]) => {
      if (values.length) searchParams.set(key, values.join(','));
      else searchParams.delete(key);
    };
    if (presetId === rawProduct.defaultPresetId) {
      searchParams.delete(PRESET_QUERY_KEY);
    } else {
      searchParams.set(PRESET_QUERY_KEY, presetId);
    }
    if (commonMode) {
      searchParams.set(MODELS_QUERY_KEY, checkedModelIds.join(','));
      setList(
        EFFORTS_QUERY_KEY,
        checkedModelIds.flatMap((id) => selectedProfiles[id] ?? []),
      );
      setList(PINS_QUERY_KEY, pinnedProfileIds);
    } else {
      [MODELS_QUERY_KEY, EFFORTS_QUERY_KEY, PINS_QUERY_KEY].forEach((key) =>
        searchParams.delete(key),
      );
    }
    if (developerMode) searchParams.set(DEVELOPER_QUERY_KEY, '1');
    else searchParams.delete(DEVELOPER_QUERY_KEY);
    window.history.replaceState(null, '', url);
  }, [
    checkedModelIds,
    commonMode,
    developerMode,
    hydration.phase,
    pinnedProfileIds,
    presetId,
    rawProduct.defaultPresetId,
    selectedProfiles,
  ]);

  const rows = useMemo(() => {
    return representatives.filter((row) =>
      checkedModelIds.includes(row.modelId),
    );
  }, [representatives, checkedModelIds]);

  const generated = formatGeneratedAt(product.generatedAt);

  const fixedProfileIds = useMemo(
    () => comparison?.profiles.map((profile) => profile.id),
    [comparison],
  );

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
          product={
            comparison
              ? comparison.product
              : product.benchmarkQuality
                ? product
                : visibleProduct
          }
          pickerProduct={product}
          rows={comparison ? comparison.product.leaderboard : rows}
          representatives={options}
          checkedModelIds={checkedModelIds}
          setCheckedModelIds={updateCheckedModels}
          onResetModels={() => selectPreset(rawProduct.defaultPresetId)}
          selectedProfiles={selectedProfiles}
          onSelectedProfileChange={(modelId, profileId) =>
            dispatch({
              type: 'setEffort',
              modelId,
              profileId,
              context: selectionContext,
            })
          }
          commonMode={commonMode}
          pinnedProfileIds={pinnedProfileIds}
          onPinProfile={(modelId, profileId) =>
            dispatch({
              type: 'pinProfile',
              modelId,
              profileId,
              context: selectionContext,
            })
          }
          onRemovePinnedProfile={(profileId) =>
            dispatch({ type: 'unpinProfile', profileId })
          }
          effortDeltas={effortDeltas}
          benchmarkDimensions={benchmarkDimensions}
          preset={comparison ? comparison.product.activePreset : activePreset}
          controlPreset={activePreset}
          onSelectPreset={selectPreset}
          initialExpandedModelIds={initialExpandedModelIds}
          developerMode={developerMode}
        />
        {commonTable && developerMode ? (
          <CommonBenchmarkTable comparison={commonTable} />
        ) : null}

        {developerMode ? (
          <div className="dashboard-section">
            <p className="eyebrow section-eyebrow">Diagnostics</p>
            <div className="panel diagnostics-panel">
              <PartialCoverageList rows={partialCoverageRows} />
              <DeveloperModelList
                rows={developerRows}
                product={product}
                benchmarkDimensions={benchmarkDimensions}
                preset={activePreset}
              />
            </div>
          </div>
        ) : null}

        <RadarChart
          key={presetId}
          product={comparison ? comparison.product : product}
          comparisonProduct={comparison ? comparison.product : visibleProduct}
          fixedProfileIds={fixedProfileIds}
        />

        <CostChart
          defaultProduct={visibleProduct}
          advancedProduct={product}
          developerMode={developerMode}
          onUseInLeaderboard={applyChartShortlist}
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
