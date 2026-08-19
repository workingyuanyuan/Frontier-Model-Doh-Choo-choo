'use client';

import type {
  DimensionId,
  DisplaySet,
  ProductVersion,
} from '@llm-bench/benchmark-data';
import { useEffect, useMemo, useState } from 'react';

import { CostChart } from './cost-chart';
import { DeveloperModelList } from './developer-model-list';
import { EvidenceDetail } from './evidence-detail';
import { Leaderboard } from './leaderboard';
import { RadarChart } from './radar-chart';
import { VersionHeader } from './version-header';
import {
  getDataScopeSummary,
  getDeveloperModelRows,
  getEvidenceForProfile,
  getRepresentativeRows,
  isMainEligibleRow,
  resolveActiveProfile,
} from '../lib/view-model';

export function Dashboard({
  benchmarkDimensions,
  displaySet,
  product,
}: {
  benchmarkDimensions: Record<string, DimensionId>;
  displaySet: DisplaySet | null;
  product: ProductVersion;
}) {
  const [developerMode, setDeveloperMode] = useState(false);
  const allRepresentatives = useMemo(
    () => getRepresentativeRows(product),
    [product],
  );
  const developerRows = useMemo(
    () => getDeveloperModelRows(product, displaySet),
    [displaySet, product],
  );
  const mainProfileIds = useMemo(
    () =>
      new Set(
        product.leaderboard
          .filter((row) => isMainEligibleRow(product, row, displaySet))
          .map(({ profileId }) => profileId),
      ),
    [displaySet, product],
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
  const visibleProduct = useMemo<ProductVersion>(
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
  const initialRow = representatives[0];

  const defaultCheckedIds = useMemo(
    () => representatives.map((r) => r.modelId),
    [representatives],
  );
  const [checkedModelIds, setCheckedModelIds] =
    useState<string[]>(defaultCheckedIds);

  const [selectedModelId, setSelectedModelId] = useState(
    initialRow?.modelId ?? '',
  );

  const [modelProfiles, setModelProfiles] = useState<Record<string, string>>(
    () => {
      const initialProfiles: Record<string, string> = {};
      allRepresentatives.forEach((row) => {
        initialProfiles[row.modelId] = row.profileId;
      });
      product.leaderboard.forEach((row) => {
        if (!initialProfiles[row.modelId]) {
          initialProfiles[row.modelId] = row.profileId;
        }
      });
      return initialProfiles;
    },
  );

  const selectedProfileId = modelProfiles[selectedModelId] ?? '';

  const [comparisonProfileIds, setComparisonProfileIds] = useState<string[]>(
    [],
  );

  const representativeRow = representatives.find(
    ({ modelId }) => modelId === selectedModelId,
  );

  const selectedProfile = resolveActiveProfile(
    visibleProduct,
    selectedModelId,
    selectedProfileId,
    representativeRow?.profileId ?? '',
  );

  useEffect(() => {
    if (selectedProfile && comparisonProfileIds.includes(selectedProfile.id)) {
      setComparisonProfileIds((prev) =>
        prev.filter((id) => id !== selectedProfile.id),
      );
    }
  }, [selectedProfile, comparisonProfileIds]);

  const selectedResult = visibleProduct.leaderboard.find(
    ({ profileId }) => profileId === selectedProfile?.id,
  );

  const rows = useMemo(() => {
    return representatives.filter((row) =>
      checkedModelIds.includes(row.modelId),
    );
  }, [representatives, checkedModelIds]);

  const evidence = selectedProfile
    ? getEvidenceForProfile(visibleProduct, selectedProfile.id)
    : [];
  const dataScope = getDataScopeSummary(visibleProduct);

  useEffect(() => {
    setCheckedModelIds(defaultCheckedIds);
    if (!visibleModelIds.has(selectedModelId)) {
      setSelectedModelId(representatives[0]?.modelId ?? '');
    }
  }, [defaultCheckedIds, representatives, selectedModelId, visibleModelIds]);

  const selectModel = (modelId: string, profileId: string) => {
    setSelectedModelId(modelId);
    setModelProfiles((prev) => ({ ...prev, [modelId]: profileId }));
  };

  const clearSelection = () => {
    setSelectedModelId('');
    setComparisonProfileIds([]);
  };

  return (
    <div id="top">
      <VersionHeader
        product={product}
        developerMode={developerMode}
        onDeveloperModeChange={setDeveloperMode}
      />
      <main className="page-shell">
        <section className="intro" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">Current frontier snapshot</p>
            <h1 id="page-title">Compare capability, cost, and evidence.</h1>
            <p>Eight capability scores, cost, and evidence.</p>
          </div>
        </section>

        <section className="panel scope-panel" aria-labelledby="scope-title">
          <div>
            <p className="eyebrow">Dataset scope</p>
            <h2 id="scope-title">Dataset at a glance.</h2>
          </div>
          <dl className="scope-metrics">
            <div data-scope-metric="frontier">
              <dt>Frontier models</dt>
              <dd>{dataScope.frontierModels}</dd>
            </div>
            <div data-scope-metric="ranked">
              <dt>Ranked models</dt>
              <dd>{dataScope.rankedModels}</dd>
            </div>
            <div data-scope-metric="profiles">
              <dt>Scored Profiles</dt>
              <dd>{dataScope.scoredProfiles}</dd>
            </div>
            <div data-scope-metric="pending">
              <dt>Awaiting direct evidence</dt>
              <dd>{dataScope.awaitingDirectEvidence}</dd>
            </div>
          </dl>
        </section>

        <Leaderboard
          product={visibleProduct}
          rows={rows}
          representatives={representatives}
          checkedModelIds={checkedModelIds}
          setCheckedModelIds={setCheckedModelIds}
          modelProfiles={modelProfiles}
          selectedModelId={selectedModelId}
          onSelect={selectModel}
        />

        {developerMode ? <DeveloperModelList rows={developerRows} /> : null}

        {selectedProfile ? (
          <RadarChart
            product={visibleProduct}
            activeProfile={selectedProfile}
            selectedResult={selectedResult}
            comparisonProfileIds={comparisonProfileIds}
            setComparisonProfileIds={setComparisonProfileIds}
            onClearActiveProfile={clearSelection}
          />
        ) : null}

        <CostChart
          product={visibleProduct}
          selectedProfileId={selectedProfile?.id ?? ''}
        />

        {selectedProfile ? (
          <EvidenceDetail
            profile={selectedProfile}
            evidence={evidence}
            benchmarkDimensions={benchmarkDimensions}
            selectedResult={selectedResult}
          />
        ) : (
          <div className="panel empty-state" role="status">
            Select a model to view its profile and evidence.
          </div>
        )}
      </main>
      <footer className="site-footer">
        <span>LLM Bench</span>
        <span>Version {product.versionId}</span>
        <span>Static, reviewable, source-backed.</span>
      </footer>
    </div>
  );
}
