import { describe, expect, it } from 'vitest';

import { discoverSourceCatalog } from './source-catalog-discovery.js';

describe('source catalog discovery', () => {
  it('reads Next evaluation cards and isolates the published benchmark title', () => {
    const html = `<!doctype html><main>
      <a class="flex flex-col" href="/evaluations/aa-briefcase">
        <div><img alt="Stirrup v4.3"><span>Updated</span></div>
        <h3>AA-Briefcase v1.1: Agentic Knowledge Work Benchmark</h3>
        <p>Top model Claude Opus 5.5, score 91.3; dataset v8.0.</p>
        <span>Business</span><span>Private Dataset</span>
      </a>
      <a href="/evaluations/terminalbench-4-0"><h3>Terminal-Bench 4.0 Benchmark Leaderboard</h3></a>
      <a href="/evaluations/artificial-analysis-intelligence-index"><h3>Artificial Analysis Intelligence Index v4.3.2</h3></a>
      <a href="/evaluations/hle"><h3>Humanity&#x27;s Last Exam Benchmark Leaderboard</h3><p>GPT v9.5</p></a>
      </main><script>self.__next_f.push([1, 'href="/evaluations/fake"'])</script>`;
    expect(discoverSourceCatalog('artificial-analysis', html)).toEqual([
      {
        id: 'aa-briefcase',
        url: 'https://artificialanalysis.ai/evaluations/aa-briefcase',
        title: 'AA-Briefcase v1.1: Agentic Knowledge Work Benchmark',
        version: 'v1.1',
      },
      {
        id: 'artificial-analysis-intelligence-index',
        url: 'https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index',
        title: 'Artificial Analysis Intelligence Index v4.3.2',
        version: 'v4.3.2',
      },
      {
        id: 'hle',
        url: 'https://artificialanalysis.ai/evaluations/hle',
        title: "Humanity's Last Exam Benchmark Leaderboard",
        version: null,
      },
      {
        id: 'terminalbench-4-0',
        url: 'https://artificialanalysis.ai/evaluations/terminalbench-4-0',
        title: 'Terminal-Bench 4.0 Benchmark Leaderboard',
        version: 'v4.0',
      },
    ]);
  });

  it('reads VALS active and archived names without model versions or dates', () => {
    const html = `<main>
      <a href='/benchmarks/finance_agent'><span>Finance Proprietary</span>
        <div><h3> Finance Agent v2 </h3><span>Updated: 10/2/2026</span>
        <p>Top Models: Claude Opus 5.5, GPT v5.6</p><span>View Details</span></div></a>
      <div><h5>CaseLaw v2</h5><p>Canadian court cases</p><a href="/benchmarks/case_law">View Details</a></div>
      <a href='/benchmarks/proofbench'><h3>ProofBench v1.1</h3></a>
      <a href='/benchmarks/legalbench'><h3>LegalBench</h3><span>Updated: 1/2/2026</span><p>Claude Opus v5.5</p></a>
    </main>`;
    const entries = discoverSourceCatalog('vals-ai', html);
    expect(
      entries.map(({ id, title, version }) => ({ id, title, version })),
    ).toEqual([
      { id: 'case_law', title: 'CaseLaw v2', version: 'v2' },
      { id: 'finance_agent', title: 'Finance Agent v2', version: 'v2' },
      { id: 'legalbench', title: 'LegalBench', version: null },
      { id: 'proofbench', title: 'ProofBench v1.1', version: 'v1.1' },
    ]);
  });

  it.each([
    'surge-chartography',
    'surge-complex-constraints',
    'surge-corecraft',
    'surge-riemann',
    'surge-dayjob-finance',
    'surge-dayjob-healthcare',
    'surge-gdp-xlsx',
  ])(
    'enumerates every Surge benchmark and strips display metrics for %s',
    (sourceId) => {
      const html = `<nav>
      <a href="/benchmarks/chartography"><span>Chartography</span><small>%</small></a>
      <a href="/benchmarks/gdp-pdf"><span>GDP.pdf</span><small>%</small></a>
      <a href="/benchmarks/enterprisebench-corecraft">EnterpriseBench: CoreCraft</a>
      <a href="/benchmarks/hemingway"><span>Hemingway-bench</span><small>ELO</small></a>
      <a href="/benchmarks/dayjob-healthcare">DAYJOB: Healthcare NEW</a>
      <a href="/benchmarks/gdp-xlsx">GDP.xlsx</a>
      <a href="/benchmarks/complexconstraints">ComplexConstraints</a>
      <a href="/benchmarks/handbook">HANDBOOK.md</a>
      <a href="/benchmarks/riemann-bench">Riemann-bench</a>
      <a href="/benchmarks/dayjob-finance">DAYJOB: Finance</a>
      <a href="/benchmarks/antidote">Antidote</a>
      <a href="/benchmarks/enterprisebench-corecraft">EnterpriseBench</a>
    </nav><section><h4>Chartography</h4><a href="/benchmarks/chartography">Leaderboard</a></section>`;
      const entries = discoverSourceCatalog(sourceId, html);
      expect(entries).toHaveLength(11);
      expect(entries.find(({ id }) => id === 'chartography')?.title).toBe(
        'Chartography',
      );
      expect(entries.find(({ id }) => id === 'hemingway')?.title).toBe(
        'Hemingway-bench',
      );
      expect(entries.find(({ id }) => id === 'dayjob-healthcare')?.title).toBe(
        'DAYJOB: Healthcare',
      );
      expect(
        entries.find(({ id }) => id === 'enterprisebench-corecraft')?.title,
      ).toBe('EnterpriseBench: CoreCraft');
      expect(
        entries.find(({ id }) => id === 'enterprisebench-corecraft'),
      ).toEqual(
        expect.objectContaining({
          id: 'enterprisebench-corecraft',
          url: 'https://surgehq.ai/benchmarks/enterprisebench-corecraft',
        }),
      );
      expect(entries.every(({ version }) => version === null)).toBe(true);
      expect(entries.find(({ id }) => id === 'complexconstraints')).toEqual({
        id: 'complexconstraints',
        title: 'ComplexConstraints',
        url: 'https://surgehq.ai/benchmarks/complexconstraints',
        version: null,
      });
      expect(entries.find(({ id }) => id === 'riemann-bench')).toEqual({
        id: 'riemann-bench',
        title: 'Riemann-bench',
        url: 'https://surgehq.ai/benchmarks/riemann-bench',
        version: null,
      });
      expect(entries.find(({ id }) => id === 'dayjob-finance')).toEqual({
        id: 'dayjob-finance',
        title: 'DAYJOB: Finance',
        url: 'https://surgehq.ai/benchmarks/dayjob-finance',
        version: null,
      });
      expect(entries.find(({ id }) => id === 'dayjob-healthcare')).toEqual({
        id: 'dayjob-healthcare',
        title: 'DAYJOB: Healthcare',
        url: 'https://surgehq.ai/benchmarks/dayjob-healthcare',
        version: null,
      });
      expect(entries.find(({ id }) => id === 'gdp-xlsx')).toEqual({
        id: 'gdp-xlsx',
        title: 'GDP.xlsx',
        url: 'https://surgehq.ai/benchmarks/gdp-xlsx',
        version: null,
      });
    },
  );

  it('deduplicates canonical links and favors benchmark headings over navigation labels', () => {
    const html = `<a href="/benchmarks/proofbench/">ProofBench</a>
      <a href="https://www.vals.ai/benchmarks/proofbench?utm_source=test#results"><h3>ProofBench v1.1</h3></a>
      <a href="//www.vals.ai/benchmarks/proofbench">View Details</a>`;
    expect(discoverSourceCatalog('vals-ai', html)).toEqual([
      {
        id: 'proofbench',
        url: 'https://www.vals.ai/benchmarks/proofbench',
        title: 'ProofBench v1.1',
        version: 'v1.1',
      },
    ]);
  });

  it('rejects external, nested, malformed and nonbenchmark links', () => {
    const html = `<a href="/benchmarks/valid">Valid</a>
      <a href="https://evil.test/benchmarks/external">External</a>
      <a href="https://www.vals.ai.evil.test/benchmarks/external">External</a>
      <a href="https://user:secret@www.vals.ai/benchmarks/credential">Credential</a>
      <a href="http://www.vals.ai/benchmarks/insecure">Insecure</a>
      <a href="/benchmarks/nested/results">Nested</a>
      <a href="/benchmarks/nested%2fresults">Encoded</a>
      <a href="/benchmarks/%2e%2e/benchmarks/traversal">Traversal</a>
      <a href="/benchmarks/../benchmarks/traversal">Traversal</a>
      <a href="/benchmarks/bad%ZZ">Bad encoding</a>
      <a href="/benchmarks/dataset.json">Asset</a>
      <a href="/benchmarks">Index</a><a href="/models/model">Model</a>
      <!-- <a href="/benchmarks/commented">Commented</a> -->
      <script><a href="/benchmarks/scripted">Scripted</a></script>`;
    expect(discoverSourceCatalog('vals-ai', html).map(({ id }) => id)).toEqual([
      'valid',
    ]);
  });

  it('changes metadata when a benchmark is renamed or versioned while retaining its identity', () => {
    const before = discoverSourceCatalog(
      'vals-ai',
      '<a href="/benchmarks/proofbench"><h3>ProofBench v1.1</h3></a>',
    )[0]!;
    const after = discoverSourceCatalog(
      'vals-ai',
      '<a href="/benchmarks/proofbench"><h3>ProofBench Pro version 2.1.3</h3></a>',
    )[0]!;
    expect(after.id).toBe(before.id);
    expect(after.title).toBe('ProofBench Pro version 2.1.3');
    expect(after.version).toBe('v2.1.3');
  });

  it('keeps a version stable when rankings, descriptions, dates or status badges change', () => {
    const card = (metadata: string) =>
      `<a href="/evaluations/briefcase"><span>${metadata}</span><h3>AA-Briefcase v1.1</h3><p>${metadata}</p></a>`;
    expect(
      discoverSourceCatalog(
        'artificial-analysis',
        card('New: GPT v5.6 94.1% 10/1/2026'),
      ),
    ).toEqual(
      discoverSourceCatalog(
        'artificial-analysis',
        card('Updated: Claude v6.1 96.2% 10/3/2026'),
      ),
    );
  });

  it('fails explicitly for empty directories and unsupported sources', () => {
    for (const source of [
      'vals-ai',
      'artificial-analysis',
      'surge-chartography',
      'surge-complex-constraints',
      'surge-corecraft',
      'surge-riemann',
      'surge-dayjob-finance',
      'surge-dayjob-healthcare',
      'surge-gdp-xlsx',
    ]) {
      expect(() => discoverSourceCatalog(source, '<h1>Directory</h1>')).toThrow(
        'no benchmark links',
      );
    }
    expect(() =>
      discoverSourceCatalog('other', '<a href="/benchmarks/a">A</a>'),
    ).toThrow('Unsupported source catalog');
  });
});
