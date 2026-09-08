import { readFile, writeFile } from 'node:fs/promises';
import { format } from 'prettier';
import { verifyProductVersion } from './index.js';
import { buildAaIndexReport, formatAaIndexReport } from './aa-index-report.js';

const [inputPath, jsonPath, markdownPath] = process.argv.slice(2);
if (!inputPath || !jsonPath || !markdownPath) {
  throw new Error(
    'Usage: report:aa-index <product.json> <report.json> <report.md>',
  );
}
const product = verifyProductVersion(
  JSON.parse(await readFile(inputPath, 'utf8')),
);
const rows = buildAaIndexReport(product);
await writeFile(
  jsonPath,
  await format(
    JSON.stringify({
      versionId: product.versionId,
      generatedAt: product.generatedAt,
      rows,
    }),
    { parser: 'json' },
  ),
);
await writeFile(
  markdownPath,
  await format(
    [
      '# AA 指數分版報告',
      '',
      `產品版本：\`${product.versionId}\`。資料日期：${product.generatedAt}。`,
      '',
      '分數使用來源 rawScore，保留 index points；名次僅比較產品收錄的同版本配置，同分並列並跳號。版本未明不排名。表格顯示四位小數，排序使用完整精度。逐列來源與 Evidence 見 JSON 報告。',
      '',
      formatAaIndexReport(rows),
      '',
    ].join('\n'),
    { parser: 'markdown' },
  ),
);
