'use client';

import {
  unpackDashboardProduct,
  type DashboardPayload,
  type DashboardProduct as ProductVersion,
} from '../lib/dashboard-data';

import type { DimensionId } from '@llm-bench/benchmark-data';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  const [presetId, setPresetId] = useState(
    initialPresetId ?? rawProduct.defaultPresetId,
  );
  const [commonMode, setCommonMode] = useState(false);
  const [pinnedProfileIds, setPinnedProfileIds] = useState<string[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<
    Record<string, string>
  >({});

  // A shared comparison waits for its preset, whose defaults it replaces.
  const pendingComparison = useRef<{
    presetId: string;
    models: string[];
    efforts: string[];
    pins: string[];
  } | null>(null);

  // Ruling D-N10-5: the preset lives in a query parameter, not a route. Read
  // once on mount so a shared link opens on the right scores, and write with
  // replaceState so switching presets does not fill the back button. The
  // comparison (models, efforts, pins) and developer mode follow the same rule.
  const urlRead = useRef(false);
  const pendingPreset = useRef<string | null>(null);
  useEffect(() => {
    // Parse once: a replayed effect would read the URL the writers already
    // rewrote for the defaults.
    if (urlRead.current) return;
    urlRead.current = true;
    const params = new URLSearchParams(window.location.search);
    const requested = params.get(PRESET_QUERY_KEY);
    const validPreset =
      requested && rawProduct.presets.some(({ id }) => id === requested)
        ? requested
        : null;
    if (validPreset) {
      pendingPreset.current = validPreset;
      setPresetId(validPreset);
    }
    if (params.get(DEVELOPER_QUERY_KEY) === '1') setDeveloperMode(true);
    if (params.has(MODELS_QUERY_KEY)) {
      pendingComparison.current = {
        presetId: validPreset ?? rawProduct.defaultPresetId,
        models: listParam(params, MODELS_QUERY_KEY),
        efforts: listParam(params, EFFORTS_QUERY_KEY),
        pins: listParam(params, PINS_QUERY_KEY),
      };
    }
  }, [rawProduct.defaultPresetId, rawProduct.presets]);

  useEffect(() => {
    if (pendingPreset.current) {
      if (pendingPreset.current !== presetId) return;
      pendingPreset.current = null;
    }
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
  // Derive a new preset's default selection in the same render. An effect
  // would first render stale selections and then repeat the entire update.
  const [selection, setSelection] = useState(() => ({
    defaults: defaultCheckedIds,
    ids: defaultCheckedIds,
  }));
  const checkedModelIds =
    selection.defaults === defaultCheckedIds
      ? selection.ids
      : defaultCheckedIds;
  const setCheckedModelIds: React.Dispatch<React.SetStateAction<string[]>> = (
    value,
  ) => {
    setSelection((current) => ({
      defaults: defaultCheckedIds,
      ids:
        typeof value === 'function'
          ? value(
              current.defaults === defaultCheckedIds
                ? current.ids
                : defaultCheckedIds,
            )
          : value,
    }));
  };
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
    setSelectedProfiles({});
    setPresetId(id);
    setCheckedModelIds(defaultCheckedIds);
  };

  const coverage = useMemo(() => profileBenchmarkCoverage(index), [index]);
  // The shortlist handler reads the latest efforts without changing identity,
  // so the memoized cost chart does not re-render on every effort change.
  const selectedProfilesRef = useRef(selectedProfiles);
  useEffect(() => {
    selectedProfilesRef.current = selectedProfiles;
  }, [selectedProfiles]);
  // Each chart model keeps its leaderboard effort while that effort is still
  // visible on the chart; otherwise its best-covered visible effort is used.
  // Pins survive only while visible and distinct from the model's effort.
  const applyChartShortlist = useCallback(
    (models: ChartShortlist) => {
      const optionIds = new Set(options.map(({ modelId }) => modelId));
      const picked = models.filter(({ modelId }) => optionIds.has(modelId));
      const ids = picked.map(({ modelId }) => modelId);
      const next = {
        ...representativeProfiles,
        ...selectedProfilesRef.current,
      };
      picked.forEach(({ modelId, profileIds }) => {
        if (profileIds.includes(next[modelId] ?? '')) return;
        const best = profileIds.reduce<string | null>(
          (top, id) =>
            (coverage.get(id) ?? 0) > (coverage.get(top ?? '') ?? 0) ? id : top,
          null,
        );
        if (best) next[modelId] = best;
      });
      const visible = new Set(picked.flatMap(({ profileIds }) => profileIds));
      setSelectedProfiles(next);
      setSelection({ defaults: defaultCheckedIds, ids });
      setPinnedProfileIds((pins) =>
        pins.filter(
          (id) => visible.has(id) && !Object.values(next).includes(id),
        ),
      );
      setCommonMode(true);
      document
        .getElementById('leaderboard-title')
        ?.scrollIntoView({ block: 'start' });
    },
    [coverage, defaultCheckedIds, options, representativeProfiles],
  );

  useEffect(() => {
    const pending = pendingComparison.current;
    if (!pending || pending.presetId !== presetId) return;
    pendingComparison.current = null;
    const optionIds = new Set(options.map(({ modelId }) => modelId));
    const ids = [...new Set(pending.models)].filter((id) => optionIds.has(id));
    const profiles = new Map(product.profiles.map((p) => [p.id, p]));
    const efforts: Record<string, string> = {};
    pending.efforts.forEach((id) => {
      const profile = profiles.get(id);
      if (profile && ids.includes(profile.modelId))
        efforts[profile.modelId] = id;
    });
    setSelection({ defaults: defaultCheckedIds, ids });
    setSelectedProfiles({ ...representativeProfiles, ...efforts });
    setPinnedProfileIds(
      [...new Set(pending.pins)].filter((id) => {
        const profile = profiles.get(id);
        return (
          profile !== undefined &&
          ids.includes(profile.modelId) &&
          efforts[profile.modelId] !== id
        );
      }),
    );
    setCommonMode(true);
  }, [
    defaultCheckedIds,
    options,
    presetId,
    product.profiles,
    representativeProfiles,
  ]);

  useEffect(() => {
    if (pendingComparison.current) return;
    const url = new URL(window.location.href);
    const { searchParams } = url;
    const setList = (key: string, values: string[]) => {
      if (values.length) searchParams.set(key, values.join(','));
      else searchParams.delete(key);
    };
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
    pinnedProfileIds,
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
          onSelectedProfileChange={(modelId, profileId) => {
            setSelectedProfiles((current) => ({
              ...Object.fromEntries(
                representatives.map((row) => [row.modelId, row.profileId]),
              ),
              ...current,
              [modelId]: profileId,
            }));
            setCommonMode(true);
          }}
          commonMode={commonMode}
          pinnedProfileIds={pinnedProfileIds}
          onPinProfile={pinProfile}
          onRemovePinnedProfile={(id) =>
            setPinnedProfileIds((ids) => ids.filter((p) => p !== id))
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
