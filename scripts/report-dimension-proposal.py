"""Produce the exhaustive active-benchmark proposal appendix; no runtime mutation."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'tmp/dimension-statistics/effective-results.json').read_text(encoding='utf-8'))
cohort = json.loads((root / 'docs/analysis/2026-10-03-frontier-cohort.json').read_text(encoding='utf-8'))
groups = {
    '推理與解題': 'arc-agi-2 chess-puzzles livebench-reasoning critpt gpqa-diamond frontiermath frontiermath-tier-4 aime livebench-mathematics proofbench riemann-bench',
    '知識與專業判斷': 'simpleqa-verified aa-omniscience humanitys-last-exam mmlu-pro medcode tax-eval-v2 legal-bench',
    '資料理解與整合': 'gdp-xlsx gdp-pdf chartography aa-lcr corpfin medscribe',
    '程式與軟體工程': 'cursorbench-4 swe-bench scicode frontier-code-1-1 deepswe-1-1 livecodebench programbench ioi code-migration vibe-code-bench cyber',
    '工具與工作流程': 'dayjob-healthcare dayjob-finance enterprisebench-corecraft finance-agent-v2 gdpval-aa apex-agents aa-briefcase automationbench tau3-banking skillsbench hlab emb legal-research public-benefits-bench terminal-bench-2-1',
    '語言與指令遵循': 'complex-constraints livebench-language ifbench livebench-instruction-following',
}
assignment = {}
for group, ids in groups.items():
    for benchmark in ids.split():
        assert benchmark not in assignment
        assignment[benchmark] = group
active = {b['id']: b for b in data['benchmarks']}
assert set(assignment) == set(active), (set(assignment)-set(active), set(active)-set(assignment))
notes = {
    'gpqa-diamond': '研究級科学問答需知識及推導，主歸推理；邊界案例。',
    'legal-bench': '法律規則應用與分類判斷；主歸專業判斷，推理次要。',
    'corpfin': '依財報材料抽取與推導公司財務結果；專業知識次要。',
    'terminal-bench-2-1': '終端環境包含軟體、系統與資料工作；整體測試主歸工具任務完成，程式為次要。',
    'skillsbench': '跨領域工具／技能任務，主歸工作流程。',
    'cyber': '漏洞重現及修補屬軟體安全工程；與一般 Coding 的弱相關列為異質性限制。',
    'medscribe': '提供的逐字稿轉為結構化 SOAP 紀錄；資料轉換主要，語言次要。',
    'medcode': '醫療分類標準應用；與程式碼生成無關。',
    'proofbench': 'Lean 為證明媒介；本次六模型 99–100，建議品質再審。',
    'humanitys-last-exam': '廣泛專家題目；本分類以知識為主，推理交叉。',
    'aa-omniscience': '本專案計分採 Accuracy，不是 Omniscience Index。',
}
rows=[]
for b in sorted(active):
    rows.append({'benchmarkId':b,'currentDimension':active[b]['primaryDimension'],'proposedDimension':assignment[b],
      'commonToFrontierSix':b in cohort['commonBenchmarkIds'],
      'qualityExcluded':b in data['qualityPolicy']['excludedBenchmarkIds'],
      'qualityLimited':b in data['qualityPolicy']['limitedBenchmarkIds'],'note':notes.get(b,'')})
out=root/'docs/analysis/2026-10-03-dimension-proposal-mapping.json'
out.write_text(json.dumps({'status':'proposal-for-user-review','rows':rows},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
report=root/'docs/analysis/2026-10-03-dimension-recommendation.md'
text=report.read_text(encoding='utf-8').split('\n## 附錄：54 項逐項分類提案')[0]
text += '\n## 附錄：54 項逐項分類提案\n\n每項只歸一個主要類別；交叉能力保存在說明。分類依測量終點，並非宣稱群內各測試可互換。現役來源有成績與目前前沿六模型共同有成績是不同範圍。\n\n| Benchmark ID | 現行 | 建議 | 六模型共同 | 說明 |\n| --- | --- | --- | --- | --- |\n'
for row in rows:
    flags = row['note']
    if row['qualityExcluded']: flags += ' 既有品質政策排除。'
    if row['qualityLimited']: flags += ' 既有品質占比限制；新類別需重新驗證。'
    text+=f"| `{row['benchmarkId']}` | {row['currentDimension']} | {row['proposedDimension']} | {'是' if row['commonToFrontierSix'] else '—'} | {flags or '依主要評分終點歸類。'} |\n"
text+='\n其他目錄項目與比較專用資料不計入54項現役自動計分母體。完整映射由本附錄的 JSON 保存。\n'
report.write_text(text,encoding='utf-8')
print('Validated 54 unique assignments; 21 frontier-common assignments.')
