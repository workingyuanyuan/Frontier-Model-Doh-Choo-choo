'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import type { CompareCopy } from '../lib/compare-copy';
import type { Locale } from '../lib/i18n';

interface ModelOption {
  slug: string;
  displayName: string;
  providerName: string;
}

interface CompareSelectorProps {
  copy: CompareCopy;
  initialSlugs: string[];
  locale: Locale;
  options: ModelOption[];
}

export function CompareSelector({
  copy,
  initialSlugs,
  locale,
  options,
}: CompareSelectorProps) {
  const router = useRouter();
  const [selected, setSelected] = useState(initialSlugs);

  const update = (index: number, slug: string) => {
    setSelected((current) =>
      current.map((value, itemIndex) => (itemIndex === index ? slug : value)),
    );
  };

  const add = () => {
    const next = options.find((option) => !selected.includes(option.slug));
    if (selected.length < 5 && next) setSelected([...selected, next.slug]);
  };

  const remove = (index: number) => {
    if (selected.length > 2) {
      setSelected(selected.filter((_, itemIndex) => itemIndex !== index));
    }
  };

  const apply = () => {
    const query = new URLSearchParams();
    for (const slug of selected) query.append('models', slug);
    router.push(`/${locale}/compare?${query.toString()}`);
  };

  return (
    <section
      className="detailSection compareSelector"
      aria-labelledby="selection-title"
    >
      <h2 id="selection-title">{copy.selection}</h2>
      <p>{copy.minHint}</p>
      <div className="compareSelectRows">
        {selected.map((slug, index) => (
          <div className="compareSelectRow" key={`${index}:${slug}`}>
            <label htmlFor={`compare-model-${index}`}>
              {copy.model} {index + 1}
            </label>
            <select
              id={`compare-model-${index}`}
              onChange={(event) => update(index, event.target.value)}
              value={slug}
            >
              {options.map((option) => (
                <option
                  disabled={
                    option.slug !== slug && selected.includes(option.slug)
                  }
                  key={option.slug}
                  value={option.slug}
                >
                  {option.displayName} · {option.providerName}
                </option>
              ))}
            </select>
            <button
              disabled={selected.length <= 2}
              onClick={() => remove(index)}
              type="button"
            >
              {copy.remove}
            </button>
          </div>
        ))}
      </div>
      <div className="compareActions">
        <button disabled={selected.length >= 5} onClick={add} type="button">
          + {copy.add}
        </button>
        <button className="compareApply" onClick={apply} type="button">
          {copy.apply}
        </button>
      </div>
    </section>
  );
}
