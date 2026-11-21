import { useExpandedModels } from '../lib/use-expanded-models';
import type { DimensionId } from '@llm-bench/benchmark-data';
import { useEffect, useMemo, useState } from 'react';
import { leaderboardMarkdown } from '../lib/leaderboard-markdown';

import {
  ECONOMY_AXIS_ID,
  getActiveDimensionIds,
  UI_DIMENSION_IDS,
} from '../lib/ui-contract';
import {
  sortLeaderboardRows,
  type LeaderboardSortKey,
  type SortDirection,
} from '../lib/table-sort';
import {
  getRepresentativeRows,
  resolveSelectedProfileId,
  type LeaderboardRow,
  type ProductPreset,
  type PresetProductVersion,
  buildProfileEconomy,
} from '../lib/view-model';
import { CopyMarkdownButton } from './copy-markdown-button';
import { ModelPicker } from './leaderboard-controls';
import { LeaderboardTable } from './leaderboard-table';
import { PresetControls } from './preset-controls';
import { presetScope, presetScopeSentence } from '../lib/preset-family';

type HeatMap = Record<string, Record<number, number>>;

export type LeaderboardProps = {
  product: PresetProductVersion;
  rows: LeaderboardRow[];
  representatives: LeaderboardRow[];
  checkedModelIds: string[];
  setCheckedModelIds: React.Dispatch<React.SetStateAction<string[]>>;
  benchmarkDimensions: Record<string, DimensionId>;
  preset: ProductPreset | null;
  onSelectPreset: (presetId: string) => void;
  initialExpandedModelIds?: string[] | undefined;
  developerMode: boolean;
  pickerProduct?: PresetProductVersion;
  /** Economy of each profile shown; computed over `product` when omitted. */
  economyByProfile?: ReadonlyMap<string, number>;
  onResetModels?: () => void;
  selectedProfiles?: Record<string, string>;
  onSelectedProfileChange?: (modelId: string, profileId: string) => void;
  commonMode?: boolean;
  controlPreset?: ProductPreset;
  pinnedProfileIds?: string[];
  onPinProfile?: (modelId: string, profileId: string) => void;
  onRemovePinnedProfile?: (profileId: string) => void;
  effortDeltas?: Record<string, number> | undefined;
};

export function Leaderboard({
  product,
  rows,
  representatives,
  checkedModelIds,
  setCheckedModelIds,
  benchmarkDimensions,
  preset,
  onSelectPreset,
  initialExpandedModelIds,
  developerMode,
  pickerProduct = product,
  economyByProfile: givenEconomy,
  onResetModels,
  selectedProfiles,
  onSelectedProfileChange,
  commonMode = false,
  controlPreset,
  pinnedProfileIds = [],
  onPinProfile,
  onRemovePinnedProfile,
  effortDeltas,
}: LeaderboardProps) {
  const { expandedModelIds, toggleExpand } = useExpandedModels(
    initialExpandedModelIds,
  );

  const [sort, setSort] = useState<{
    key: LeaderboardSortKey;
    direction: SortDirection;
  }>({ key: 'overall', direction: 'descending' });

  const [localModelProfiles, setModelProfiles] = useState<
    Record<string, string>
  >(() => {
    const initialProfiles: Record<string, string> = {};
    const allRepresentatives = getRepresentativeRows(product);
    allRepresentatives.forEach((row) => {
      initialProfiles[row.modelId] = row.profileId;
    });
    product.leaderboard.forEach((row) => {
      if (!initialProfiles[row.modelId]) {
        initialProfiles[row.modelId] = row.profileId;
      }
    });
    return initialProfiles;
  });

  const handleProfileChange = (modelId: string, profileId: string) => {
    onSelectedProfileChange?.(modelId, profileId);
    setModelProfiles((prev) => ({ ...prev, [modelId]: profileId }));
  };

  const modelProfiles = selectedProfiles ?? localModelProfiles;
  const activeRows = useMemo(
    () =>
      rows.map((representative) => {
        if (commonMode) return representative;
        const profileId = resolveSelectedProfileId(
          product,
          representative.modelId,
          modelProfiles[representative.modelId],
          representative.profileId,
        );
        const selected = product.leaderboard.find(
          (row) => row.profileId === profileId,
        );
        return selected
          ? { ...selected, rank: representative.rank }
          : representative;
      }),
    [modelProfiles, product.leaderboard, rows, commonMode],
  );

  const dimensionIds = useMemo(
    () => getActiveDimensionIds(activeRows),
    [activeRows],
  );
  const effectiveSort =
    UI_DIMENSION_IDS.some((dimension) => dimension === sort.key) &&
    !dimensionIds.some((dimension) => dimension === sort.key)
      ? { key: 'overall' as const, direction: 'descending' as const }
      : sort;
  useEffect(() => {
    if (effectiveSort !== sort) setSort(effectiveSort);
  }, [effectiveSort, sort]);
  // Each row's Economy comes from the task costs of the profile it shows.
  const economyByProfile = useMemo(
    () => givenEconomy ?? buildProfileEconomy(product),
    [givenEconomy, product],
  );
  const sortedRows = useMemo(
    () =>
      sortLeaderboardRows(product, activeRows, effectiveSort, economyByProfile),
    [activeRows, product, effectiveSort, economyByProfile],
  );

  const onSort = (key: LeaderboardSortKey) =>
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }));

  const heatMap = useMemo<HeatMap>(() => {
    // The five highest distinct values of a column are shaded.
    const topFive = (values: (number | null | undefined)[]) =>
      Object.fromEntries(
        [...new Set(values.filter((value) => value != null))]
          .sort((left, right) => right - left)
          .slice(0, 5)
          .map((value, index) => [value, index + 1]),
      );
    const map: HeatMap = Object.fromEntries(
      dimensionIds.map((dimensionId) => [
        dimensionId,
        topFive(
          activeRows.map(
            (row) =>
              row.dimensions.find(({ dimension }) => dimension === dimensionId)
                ?.score,
          ),
        ),
      ]),
    );
    map[ECONOMY_AXIS_ID] = topFive(
      activeRows.map((row) => economyByProfile.get(row.profileId)),
    );
    return map;
  }, [activeRows, dimensionIds, economyByProfile]);

  const scopePreset = controlPreset ?? product.activePreset;
  const scope = presetScope(pickerProduct, scopePreset.id);
  const scopeSentence = scope
    ? presetScopeSentence(scope, scopePreset.targetModelCount)
    : null;

  return (
    <div className="dashboard-section">
      <p className="eyebrow section-eyebrow">Representative profiles</p>
      <section
        className="panel leaderboard-panel"
        aria-labelledby="leaderboard-title"
      >
        <div className="section-heading">
          <div>
            <h2 id="leaderboard-title">
              {pinnedProfileIds.length
                ? 'Compare reasoning efforts.'
                : 'One row per base model.'}
            </h2>
            {scopeSentence && !commonMode ? (
              <p className="preset-scope" data-testid="preset-scope">
                {scopeSentence}
              </p>
            ) : null}
          </div>
          <div className="leaderboard-toolbar">
            <PresetControls
              presets={product.presets}
              activePreset={controlPreset ?? product.activePreset}
              onSelectPreset={onSelectPreset}
            />
            <div className="leaderboard-table-actions">
              <ModelPicker
                product={pickerProduct}
                representatives={representatives}
                checkedModelIds={checkedModelIds}
                setCheckedModelIds={setCheckedModelIds}
                onReset={onResetModels}
              />
              <CopyMarkdownButton
                label="Copy table as Markdown"
                markdown={() =>
                  leaderboardMarkdown(product, sortedRows, economyByProfile)
                }
              />
            </div>
          </div>
        </div>

        <LeaderboardTable
          developerMode={developerMode}
          product={product}
          rows={sortedRows}
          sort={effectiveSort}
          onSort={onSort}
          heatMap={heatMap}
          economyByProfile={economyByProfile}
          modelProfiles={modelProfiles}
          onProfileChange={handleProfileChange}
          benchmarkDimensions={benchmarkDimensions}
          preset={preset}
          expandedModelIds={expandedModelIds}
          onToggleExpand={toggleExpand}
          commonMode={commonMode}
          pinnedProfileIds={pinnedProfileIds}
          onPinProfile={onPinProfile}
          onRemovePinnedProfile={onRemovePinnedProfile}
          effortDeltas={effortDeltas}
        />

        {rows.length === 0 ? (
          <div className="empty-state" role="status">
            <strong>No matching models</strong>
            <span>Try a provider, base model, or effort level.</span>
          </div>
        ) : null}
      </section>
    </div>
  );
}
