export interface CatalogEntry {
  id: string;
  url: string;
  title: string;
  version: string | null;
}

const directories: Record<string, string> = {
  'artificial-analysis': 'https://artificialanalysis.ai/evaluations',
  'vals-ai': 'https://www.vals.ai/benchmarks',
  'surge-chartography': 'https://surgehq.ai/benchmarks',
  'surge-complex-constraints': 'https://surgehq.ai/benchmarks',
  'surge-corecraft': 'https://surgehq.ai/benchmarks',
  'surge-riemann': 'https://surgehq.ai/benchmarks',
  'surge-dayjob-finance': 'https://surgehq.ai/benchmarks',
  'surge-dayjob-healthcare': 'https://surgehq.ai/benchmarks',
  'surge-gdp-xlsx': 'https://surgehq.ai/benchmarks',
};

function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    amp: '&',
    quot: '"',
    apos: "'",
    lt: '<',
    gt: '>',
    nbsp: ' ',
    ndash: '–',
    mdash: '—',
    rsquo: '’',
  };
  return value.replace(
    /&(#x[\da-f]+|#\d+|[a-z]+);/giu,
    (whole, entity: string) => {
      if (!entity.startsWith('#')) return named[entity.toLowerCase()] ?? whole;
      const point =
        entity[1]?.toLowerCase() === 'x'
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
      return point > 0 &&
        point <= 0x10ffff &&
        !(point >= 0xd800 && point <= 0xdfff)
        ? String.fromCodePoint(point)
        : whole;
    },
  );
}

function textContent(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/gu, ' '))
    .replace(/\s+/gu, ' ')
    .trim();
}

function attribute(tag: string, name: string): string | null {
  const match = tag.match(
    new RegExp(
      `(?:\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
      'iu',
    ),
  );
  return match ? decodeEntities(match[1] ?? match[2] ?? match[3] ?? '') : null;
}

function cleanTitle(title: string): string {
  return title
    .replace(/^(?:(?:New|Updated|Under review)\s+)+/iu, '')
    .replace(/\s+(?:NEW|Updated)$/gu, '')
    .replace(/\s*(?:%|ELO)$/u, '')
    .trim();
}

function titleVersion(title: string): string | null {
  const explicit = title.match(
    /\b(?:v(?:ersion)?\s*)(\d+(?:\.\d+)*)(?![\w.])/iu,
  );
  // A numbered benchmark generation can be printed without the v prefix.
  // Limit this form to the end of the benchmark name, never card descriptions.
  const generation = title.match(
    /\s(\d+\.\d+(?:\.\d+)*)(?=\s*(?:Benchmark(?:\s+Leaderboard)?|Leaderboard)?$)/u,
  );
  const version = explicit?.[1] ?? generation?.[1];
  return version ? `v${version}` : null;
}

function benchmarkUrl(href: string, directory: URL): URL | null {
  // Reject traversal and encoded separators before URL normalizes the path.
  if (/[\\\s]/u.test(href) || /%(?:2f|5c|2e)/iu.test(href)) return null;
  if (/(?:^|\/)\.{1,2}(?:\/|$|[?#])/u.test(href)) return null;
  try {
    const url = new URL(href, directory);
    if (url.origin !== directory.origin || url.username || url.password)
      return null;
    const prefix = `${directory.pathname}/`;
    if (!url.pathname.startsWith(prefix)) return null;
    const slug = url.pathname.slice(prefix.length).replace(/\/$/u, '');
    // Directory catalogs link to single pages, not assets or nested routes.
    if (!/^[a-z\d][a-z\d_-]*$/iu.test(slug)) return null;
    url.pathname = `${prefix}${slug}`;
    url.search = '';
    url.hash = '';
    return url;
  } catch {
    return null;
  }
}

/** Read published directory links without evaluating scripts or following links. */
export function discoverSourceCatalog(
  sourceId: string,
  html: string,
): CatalogEntry[] {
  const directoryUrl = directories[sourceId];
  if (!directoryUrl) throw new Error(`Unsupported source catalog: ${sourceId}`);
  const directory = new URL(directoryUrl);
  const markup = html
    .replace(/<!--[^]*?-->/gu, '')
    .replace(/<(script|style)\b[^>]*>[^]*?<\/\1\s*>/giu, '');
  const entries = new Map<string, { entry: CatalogEntry; priority: number }>();
  for (const match of markup.matchAll(/<a\b([^>]*?)>([^]*?)<\/a\s*>/giu)) {
    const href = attribute(` ${match[1] ?? ''}`, 'href');
    if (!href) continue;
    const url = benchmarkUrl(href, directory);
    if (!url) continue;
    const id = url.pathname.split('/').at(-1)!;
    const body = match[2] ?? '';
    const heading = body.match(/<h[1-6]\b[^>]*>([^]*?)<\/h[1-6]\s*>/iu);
    const label =
      attribute(` ${match[1] ?? ''}`, 'aria-label') ??
      attribute(` ${match[1] ?? ''}`, 'title');
    const visible = textContent(
      body.replace(/<small\b[^>]*>[^]*?<\/small>/giu, ''),
    );
    let title = cleanTitle(textContent(heading?.[1] ?? label ?? visible));
    let priority = heading ? 4 : label ? 3 : 2;
    if (
      !title ||
      /^(?:View Details|Leaderboard|View all results|Learn more)$/iu.test(title)
    ) {
      // Archived VALS cards and Surge sections put the name above the link.
      const preceding = markup.slice(
        Math.max(0, (match.index ?? 0) - 4000),
        match.index,
      );
      const priorHeading = [
        ...preceding.matchAll(/<h[1-6]\b[^>]*>([^]*?)<\/h[1-6]\s*>/giu),
      ].at(-1);
      title = priorHeading
        ? cleanTitle(textContent(priorHeading[1] ?? ''))
        : id;
      priority = priorHeading ? 1 : 0;
    }
    const previous = entries.get(id);
    if (
      previous &&
      (previous.priority > priority ||
        (previous.priority === priority &&
          previous.entry.title.length >= title.length))
    )
      continue;
    entries.set(id, {
      entry: { id, url: url.href, title, version: titleVersion(title) },
      priority,
    });
  }
  if (entries.size === 0)
    throw new Error(`${sourceId} catalog exposed no benchmark links`);
  return [...entries.values()]
    .map(({ entry }) => entry)
    .toSorted((left, right) => left.id.localeCompare(right.id));
}
