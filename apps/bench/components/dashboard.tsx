'use client';

import type {
  DimensionId,
  DisplaySet,
  ProductVersion,
} from '@llm-bench/benchmark-data';
import { useEffect, useMemo, useState } from 'react';

import { CostChart } from './cost-chart';
import { DeveloperModelList } from './developer-model-list';
import { Leaderboard } from './leaderboard';
import { RadarChart } from './radar-chart';
import { VersionHeader } from './version-header';
import {
  getDataScopeSummary,
  getDeveloperModelRows,
  getRepresentativeRows,
  isMainEligibleRow,
} from '../lib/view-model';

export function Dashboard({
  benchmarkDimensions,
  displaySet,
  product,
  initialExpandedModelIds,
}: {
  benchmarkDimensions: Record<string, DimensionId>;
  displaySet: DisplaySet | null;
  product: ProductVersion;
  initialExpandedModelIds?: string[] | undefined;
}) {
  const [developerMode, setDeveloperMode] = useState(false);
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

  const dataScope = getDataScopeSummary(visibleProduct);

  useEffect(() => {
    setCheckedModelIds(defaultCheckedIds);
  }, [defaultCheckedIds]);

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
          benchmarkDimensions={benchmarkDimensions}
          displaySet={displaySet}
          initialExpandedModelIds={initialExpandedModelIds}
        />

        {developerMode ? (
          <DeveloperModelList
            rows={developerRows}
            product={product}
            benchmarkDimensions={benchmarkDimensions}
            displaySet={displaySet}
          />
        ) : null}

        <RadarChart product={product} comparisonProduct={visibleProduct} />

        <CostChart defaultProduct={visibleProduct} advancedProduct={product} />
      </main>
      <footer className="site-footer">
        <span>LLM Bench</span>
        <span>Version {product.versionId}</span>
        <span>Static, reviewable, source-backed.</span>
      </footer>
    </div>
  );
}
