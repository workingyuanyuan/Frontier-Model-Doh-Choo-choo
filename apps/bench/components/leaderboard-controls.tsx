import type { ProductVersion } from '@llm-bench/benchmark-data';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  getProfileDisplayName,
  getProfileIdentity,
  getProfilesForModel,
  type LeaderboardRow,
} from '../lib/view-model';
import { type LeaderboardSortKey, type SortDirection } from '../lib/table-sort';

export function SortHeader({
  label,
  sortKey,
  active,
  direction,
  onSort,
}: {
  label: string;
  sortKey: LeaderboardSortKey;
  active: boolean;
  direction: SortDirection;
  onSort: (key: LeaderboardSortKey) => void;
}) {
  return (
    <button
      type="button"
      className="table-sort-button"
      data-leaderboard-sort
      aria-label={`Sort by ${label}`}
      onClick={() => onSort(sortKey)}
    >
      <span>{label}</span>
      <span className="sort-indicator" aria-hidden="true">
        {active ? (direction === 'ascending' ? '↑' : '↓') : '↕'}
      </span>
    </button>
  );
}

export function ModelPicker({
  product,
  representatives,
  checkedModelIds,
  setCheckedModelIds,
}: {
  product: ProductVersion;
  representatives: LeaderboardRow[];
  checkedModelIds: string[];
  setCheckedModelIds: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const defaultCheckedIds = useMemo(
    () => representatives.map((row) => row.modelId),
    [representatives],
  );

  useEffect(() => {
    if (!isOpen) return;
    searchInputRef.current?.focus();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredRepresentatives = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return representatives;

    return representatives.filter((row) => {
      const profiles = getProfilesForModel(product, row.modelId, row.profileId);
      return profiles.some((profile) => {
        const values = [
          profile.baseModelName,
          getProfileDisplayName(profile),
          getProfileIdentity(profile),
          profile.attributes?.effort,
          profile.providerId,
          profile.modelId,
          row.modelId,
        ];
        return values.some((value) =>
          (value ?? '').toLowerCase().includes(normalized),
        );
      });
    });
  }, [product, query, representatives]);

  const updateCheckedModel = (modelId: string, checked: boolean) => {
    setCheckedModelIds((current) => {
      if (checked) {
        return current.includes(modelId) ? current : [...current, modelId];
      }
      return current.filter((id) => id !== modelId);
    });
  };

  return (
    <div className="picker-container">
      <button
        ref={triggerRef}
        type="button"
        className="picker-trigger-btn"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="picker-popover"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>Search models or profiles</span>
        <span className="selected-badge">
          {checkedModelIds.length} selected
        </span>
      </button>

      {isOpen ? (
        <div
          ref={popoverRef}
          className="picker-popover is-open"
          role="dialog"
          aria-label="Model visibility options"
          id="picker-popover"
        >
          <div className="picker-search-container">
            <input
              ref={searchInputRef}
              type="search"
              name="model-profile-filter"
              className="picker-search-input"
              placeholder="Search models or profiles..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Filter models in list"
            />
          </div>
          <div className="picker-list">
            {filteredRepresentatives.map((row) => {
              const profile = product.profiles.find(
                (candidate) => candidate.id === row.profileId,
              );
              const modelName = profile?.baseModelName ?? row.modelId;
              return (
                <label key={row.modelId} className="picker-item">
                  <input
                    type="checkbox"
                    checked={checkedModelIds.includes(row.modelId)}
                    onChange={(event) =>
                      updateCheckedModel(row.modelId, event.target.checked)
                    }
                  />
                  <span>{modelName}</span>
                </label>
              );
            })}
          </div>
          <div className="picker-actions">
            <button
              type="button"
              onClick={() =>
                setCheckedModelIds(representatives.map((row) => row.modelId))
              }
            >
              Select all
            </button>
            <button type="button" onClick={() => setCheckedModelIds([])}>
              Clear
            </button>
            <button
              type="button"
              onClick={() => setCheckedModelIds(defaultCheckedIds)}
            >
              Default
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
