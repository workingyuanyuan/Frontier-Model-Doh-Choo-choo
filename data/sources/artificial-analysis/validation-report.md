# Artificial Analysis acquisition validation

- Evaluation pages combined: `omniscience`, `gdpval-aa`, `gdp-pdf`, `apex-agents-aa`, `aa-briefcase`, `mka`, `critpt`, `tau3-banking`, `gpqa-diamond`, `humanitys-last-exam`, `ifbench`, `scicode`, `terminalbench-v2-1`, `artificial-analysis-long-context-reasoning`, `mmmu-pro`, `aa-analyst-agent`, `automationbench-aa`, `enterprise-ops-gym-aa`, `harvey-lab-aa`, `itbench-aa`, `hle-diamond`, `terminal-bench-science`, `critpt-v2`, `frontiercode-2-0`, `terminalbench-4-0`
- Model-set composition: union every page row, keep non-deleted rows released on or after 2025-08-17 including deprecated models, then fetch `/models/<slug>` detail payloads for task cost and token-price fields.
- `$undefined` is treated as missing data together with `null`; it never creates a CandidateResult or CostRecord.

## Exact counts

| Check | Count |
|---|---:|
| Unique profile rows across all captured page payloads | 288 |
| Unique profile rows in evaluation-page payloads | 113 |
| Unique profile rows in model-detail payloads | 288 |
| Profile rows in the /models payload | 27 |
| Eligible profile rows (2025-08-17 cutoff, including deprecated) | 278 |
| Generated CandidateResults | 3118 |
| Intelligence Index candidates (EXCLUDED) | 125 |
| GDPval-AA normalized candidates | 210 |
| Canonically unresolved candidates | 960 |
| MEASURED_TASK cost rows | 120 |
| API_STANDARDIZED token-price rows | 247 |

## Page composition finding

- The rendered `/models` catalog total is checked separately by the refresh command; its RSC payload exposes 27 selected profile rows in this capture.
- The evaluation-page payload union exposes 113 profiles. `/evaluations/gdpval-aa` carries 0 `gdpvalNormalized` values, so normalized GDPval-AA is read from the model-detail payload that actually carries the field.
- The model-detail payload union exposes 288 profiles and is the source for Intelligence Index, normalized GDPval-AA, task cost, and token-price fields when present.
- Missing Index, score, or cost remains absent; it is not estimated or filled with zero.

## API cross-validation

- API source unavailable; page pipeline remains authoritative.
- No real API differences recorded beyond rounding.
- Warning: API cross-validation failed; page pipeline continued: Error: https://artificialanalysis.ai/api/v2/data/llms/models returned HTTP 410

## Scope and semantics

- Artificial Analysis composite indices remain `EXCLUDED`; direct evaluation scores are the only AA rows eligible for the eight-dimensional product score.
- Token prices are `API_STANDARDIZED` and task costs are `MEASURED_TASK`; the two cost semantics are emitted as separate records.
- No missing score, identity, or cost is inferred.

## Intelligence Index v5 evaluations

Integrated for scoring on 2026-10-28 (user decision: AA v5 additions are scored).

| Evaluation page | Field | Benchmark ID | Candidates | Canonically resolved |
|---|---|---|---:|---:|
| `terminalbench-4-0` | `terminalBench40` | `terminal-bench-4-0` | 201 | 153 |
| `hle-diamond` | `hleDiamond` | `hle-diamond` | 147 | 106 |
| `terminal-bench-science` | `terminalBenchScience` | `terminal-bench-science` | 138 | 104 |
| `critpt-v2` | `critptAgentic` | `critpt-v2` | 58 | 42 |
| `frontiercode-2-0` | `frontierCode20` | `frontier-code-2-0` | 127 | 96 |

- `frontier-code-2-0` is shared with the organizer source `frontier-code` (Cognition). AA rows are INDEPENDENT/PARTIAL_SOURCE, so the ORGANIZER row wins every overlapping profile; AA rows only fill profiles Cognition did not run.
- `critpt-v2` uses the Full Set (`critptAgentic`, the default leaderboard tab). The Index weights the 40-question Hard Subset (`critptAgenticHard`), which is not materialized.
- Not integrated: AutomationBench-AA (`automationBenchPartialScore`); CritPt v2 Hard Subset (`critptAgenticHard`); AA FrontierCode 1.1 (`frontierCode`).
- Warning: Model detail qwen3-8-27b-low failed: Error: existing content-addressed artifact is corrupt

## AA-Briefcase rows retained from the previous snapshot

- AA-Briefcase rubric rows: 29 observed in this capture; 165 retained unchanged from the previous snapshot because the profile is still listed but no longer exposes rubricPassRate (original score, observedAt and Evidence kept; not re-observed).
- Retention rule: a previous `aa-briefcase` rubric row is kept only when this capture has no row with the same ID, the same profile slug is still an eligible (non-deleted, in-window, newest-build) profile, and no current rubric row covers the same canonical model and effort. Values present in this capture always win.
- artificial-analysis:aa-briefcase:agnes-2-5-pro-theta: 0.5200411099691675; observed 2026-11-13T05:10:48.813Z; Evidence sha256:fd142558ff3312243ebf02218c3f7067448f16f05928ebf030532ad32080ebb8.
- artificial-analysis:aa-briefcase:apodex-1-1: 0.2937563971340839; observed 2026-11-13T05:10:48.813Z; Evidence sha256:8c2d22de94b2df4f07d30a427cf7a4bc1e429223e76efd5acbe159f566d440cc.
- artificial-analysis:aa-briefcase:claude-fable-5: 0.5595959595959596; observed 2026-11-13T05:10:48.813Z; Evidence sha256:c5c3feef2a9d51fc1172795a75513532843e32969f5ddf68443d8b9e0df2c9cb.
- artificial-analysis:aa-briefcase:claude-fable-5-1-high: 0.5717171717171717; observed 2026-11-13T05:10:48.813Z; Evidence sha256:9051eaeee312e30365b2de6784cfceb41aedee594db694dda4c211508a8f0ab7.
- artificial-analysis:aa-briefcase:claude-fable-5-1-low: 0.5535353535353535; observed 2026-11-13T05:10:48.813Z; Evidence sha256:2b47c25077d14b781f657178d0107a49cf25c14ee378d17056ebe0c5d716e683.
- artificial-analysis:aa-briefcase:claude-fable-5-1-medium: 0.5606060606060606; observed 2026-11-13T05:10:48.813Z; Evidence sha256:bffd06e582ccc07c39db5f27b05c89ecb5977602d0acb51de0c7a046819af30f.
- artificial-analysis:aa-briefcase:claude-fable-5-1-xhigh: 0.6060606060606061; observed 2026-11-13T05:10:48.813Z; Evidence sha256:c4a77eb1b55e313343747cff5e79719ed315d0aa8f42f6b5dd4b07990308640b.
- artificial-analysis:aa-briefcase:claude-fable-5-2-high: 0.6292929292929293; observed 2026-11-13T05:10:48.813Z; Evidence sha256:97382cda9eabfae6278f3b4833e110d00f458cba31186fad08bb2aed41b1f82b.
- artificial-analysis:aa-briefcase:claude-fable-5-2-low: 0.5686868686868687; observed 2026-11-13T05:10:48.813Z; Evidence sha256:2a510de887994693574b5fbafd049be92509b8db95544221eb9bd209234e43da.
- artificial-analysis:aa-briefcase:claude-fable-5-2-medium: 0.6101010101010101; observed 2026-11-13T05:10:48.813Z; Evidence sha256:6ad4719fe5593fed592f92c1ce4e8c669062934e004abd6b7d63d237f220e423.
- artificial-analysis:aa-briefcase:claude-fable-5-2-xhigh: 0.6515151515151515; observed 2026-11-13T05:10:48.813Z; Evidence sha256:ec63807bc40888e6ce6fd5c9f13b3f17f51ff3555c77faa5dd9044f4c75bc9ce.
- artificial-analysis:aa-briefcase:claude-haiku-5-5-high: 0.4696969696969697; observed 2026-11-13T05:10:48.813Z; Evidence sha256:12f6d00ce9e3dbf5f7c6dcd27159806f6202869f2e7261f1440650cf7b41f4d5.
- artificial-analysis:aa-briefcase:claude-haiku-5-5-low: 0.3383838383838384; observed 2026-11-13T05:10:48.813Z; Evidence sha256:d71a7079fc06fa83c76b4f296ccc818514a099eaf542608324479a83a990ab78.
- artificial-analysis:aa-briefcase:claude-haiku-5-5-medium: 0.4494949494949495; observed 2026-11-13T05:10:48.813Z; Evidence sha256:e4d5c7dd1c0afde98c8d1b5f8377a4a1870c5c34c9c538bf90558c6f3dfdee0c.
- artificial-analysis:aa-briefcase:claude-haiku-5-5-xhigh: 0.5141414141414141; observed 2026-11-13T05:10:48.813Z; Evidence sha256:99ff0ca2dcf20cd90d9c9cba2c7a5c9a8dbc868e2838e2b6d591409cd504f11d.
- artificial-analysis:aa-briefcase:claude-opus-4-7: 0.39337474120082816; observed 2026-11-13T05:10:48.813Z; Evidence sha256:54380be8de66f27992e616c92ef8774124e996480492b65ad25430888ab572e7.
- artificial-analysis:aa-briefcase:claude-opus-4-7-non-reasoning: 0.27635619242579323; observed 2026-11-13T05:10:48.813Z; Evidence sha256:7d8ac110b9cbaec97a579bb10da0ab2852aa046812327d8ef2846bce205a283c.
- artificial-analysis:aa-briefcase:claude-opus-4-8: 0.38686868686868686; observed 2026-11-13T05:10:48.813Z; Evidence sha256:6dda246715bd48956e1ce904cf9a81b11eebf0ced3a7c1afeb4a7cb1a7b4126c.
- artificial-analysis:aa-briefcase:claude-opus-5: 0.5717171717171717; observed 2026-11-13T05:10:48.813Z; Evidence sha256:b71f4249e1318c5132e5d7552c326e03ee70f9c76db8e40cfafad6c2239f5767.
- artificial-analysis:aa-briefcase:claude-opus-5-5-high: 0.5888888888888889; observed 2026-11-13T05:10:48.813Z; Evidence sha256:dfca4e7a888ef01e1ab4e1ef38bcb274293ba85844c3d6910821414fdb5b5f0b.
- artificial-analysis:aa-briefcase:claude-opus-5-5-low: 0.42525252525252527; observed 2026-11-13T05:10:48.813Z; Evidence sha256:f726af6c32c76495eb1420e190d590d4cabb8e74aca0c0c554da86be5b589013.
- artificial-analysis:aa-briefcase:claude-opus-5-5-medium: 0.5696969696969697; observed 2026-11-13T05:10:48.813Z; Evidence sha256:94188a08e7f363cd81887dca1b7db47bdb81c4a6e2f14867545e93b41ba89dd2.
- artificial-analysis:aa-briefcase:claude-opus-5-5-xhigh: 0.6060606060606061; observed 2026-11-13T05:10:48.813Z; Evidence sha256:afdcc4916a3616a69c55ccf0873ef4ad0fc5f6bac0f15b56efa8d47f9b979996.
- artificial-analysis:aa-briefcase:claude-opus-5-high: 0.5383838383838384; observed 2026-11-13T05:10:48.813Z; Evidence sha256:3f29219ee7aea907b7ecbdf492bb271dd605bf76afd64713e2df786cc2c932e3.
- artificial-analysis:aa-briefcase:claude-opus-5-low: 0.38181818181818183; observed 2026-11-13T05:10:48.813Z; Evidence sha256:22469e0c184c1093170a55500c271f539e3e9e93f444242d4dda7fe61e29ec8d.
- artificial-analysis:aa-briefcase:claude-opus-5-medium: 0.48484848484848486; observed 2026-11-13T05:10:48.813Z; Evidence sha256:24d33e362f5a5e5b051f6bb2e1a538ad120e3b12d4db7096a6f8df64195c97d1.
- artificial-analysis:aa-briefcase:claude-opus-5-xhigh: 0.5797979797979798; observed 2026-11-13T05:10:48.813Z; Evidence sha256:bf76bf6063e1636ccaa935d7c2d47aa576e0a7ca99ce2f6ecc82a5ee58a0ebdb.
- artificial-analysis:aa-briefcase:claude-sonnet-4-6-adaptive: 0.289198606271777; observed 2026-11-13T05:10:48.813Z; Evidence sha256:4e916e238217e9945abb77f493b6d2f7a2a85a94c3b1f38d52d5a6d33c4a2819.
- artificial-analysis:aa-briefcase:claude-sonnet-5: 0.42323232323232324; observed 2026-11-13T05:10:48.813Z; Evidence sha256:4d0468e98105bd86dacab9d47c2bf5b6ef20ba0cfbb7d9161d4cb49c42bbd71e.
- artificial-analysis:aa-briefcase:claude-sonnet-5-5-high: 0.602020202020202; observed 2026-11-13T05:10:48.813Z; Evidence sha256:8bac29381374b1f630f6844caa9075ee2e2ff753785cc7313dcf5281499f29b8.
- artificial-analysis:aa-briefcase:claude-sonnet-5-5-low: 0.4171717171717172; observed 2026-11-13T05:10:48.813Z; Evidence sha256:af338739fd2b87935705a2e847bf39efeae365a178fef4d34b2b17a5c1f35f09.
- artificial-analysis:aa-briefcase:claude-sonnet-5-5-medium: 0.509090909090909; observed 2026-11-13T05:10:48.813Z; Evidence sha256:bc0c48de18b54df0dbfe2e9135ef4bf2f02c6315663cf87f06eebce8904432d4.
- artificial-analysis:aa-briefcase:claude-sonnet-5-5-xhigh: 0.6222222222222222; observed 2026-11-13T05:10:48.813Z; Evidence sha256:e3d46806b49e37327c626cc19694951261c9a7f702ccab353a83aff5a451f031.
- artificial-analysis:aa-briefcase:claude-sonnet-5-high: 0.35454545454545455; observed 2026-11-13T05:10:48.813Z; Evidence sha256:c8f929851845c4a01452742483f10fd81f1c2e1ddbb62c657506590584933d64.
- artificial-analysis:aa-briefcase:claude-sonnet-5-low: 0.24646464646464647; observed 2026-11-13T05:10:48.813Z; Evidence sha256:331fc034cdf335e9847db9e94ab50fa612225cb062c331b60c37bf63ce5609b8.
- artificial-analysis:aa-briefcase:claude-sonnet-5-medium: 0.2909090909090909; observed 2026-11-13T05:10:48.813Z; Evidence sha256:e10035e74d65dc6da843e6f496b1faa7dba884e17b0147281431d73fd165997d.
- artificial-analysis:aa-briefcase:claude-sonnet-5-xhigh: 0.4; observed 2026-11-13T05:10:48.813Z; Evidence sha256:1be8f62f2856a16965a7443c02c2040fe2e8d9b033a1cda96fcb4ce3fe083039.
- artificial-analysis:aa-briefcase:command-a-plus: 0.06917599186164802; observed 2026-11-13T05:10:48.813Z; Evidence sha256:fd142558ff3312243ebf02218c3f7067448f16f05928ebf030532ad32080ebb8.
- artificial-analysis:aa-briefcase:deepseek-v4-1-flash: 0.45194274028629855; observed 2026-11-13T05:10:48.813Z; Evidence sha256:f6ea7b58036299699950ca0346a4354a6b2a0d5416468745d75c26251fbbf37b.
- artificial-analysis:aa-briefcase:deepseek-v4-1-flash-1017-high: 0.41919191919191917; observed 2026-11-13T05:10:48.813Z; Evidence sha256:c59bc153134dc93c94ba6ba7734e43c833995acc040ff9e1d9e7b93681893bca.
- artificial-analysis:aa-briefcase:deepseek-v4-1-flash-1017-non-reasoning: 0.4484848484848485; observed 2026-11-13T05:10:48.813Z; Evidence sha256:1b8f5856783b4a928e07ae5fed423cd9834c4f917dd9a6dd958f686bd355dbb9.
- artificial-analysis:aa-briefcase:deepseek-v4-1-flash-non-reasoning: 0.3363821138211382; observed 2026-11-13T05:10:48.813Z; Evidence sha256:cb18df99c1804d6a5b475167373c4a708dbc61bb1160282c61d62bb26ba8b600.
- artificial-analysis:aa-briefcase:deepseek-v4-flash: 0.41515151515151516; observed 2026-11-13T05:10:48.813Z; Evidence sha256:e8a720fd86ea8a36f5fb8411aa5bb75919140c48307d3e599fee4b67f5d83b59.
- artificial-analysis:aa-briefcase:deepseek-v4-flash-0420: 0.18680203045685279; observed 2026-11-13T05:10:48.813Z; Evidence sha256:1642a6eadb3219e4bcca794575ffd9a0b3ae975cec8598e0806c174cad520eef.
- artificial-analysis:aa-briefcase:deepseek-v4-flash-0420-high: 0.28484848484848485; observed 2026-11-13T05:10:48.813Z; Evidence sha256:9c238add341a7369720030e6d41ad50141e8ee8085f37314b4b677635b180cde.
- artificial-analysis:aa-briefcase:deepseek-v4-flash-vision: 0.4614594039054471; observed 2026-11-13T05:10:48.813Z; Evidence sha256:e7f0cf1360d41ae85163c508036c5b0224b0746431e51565bfe277d716e07839.
- artificial-analysis:aa-briefcase:deepseek-v4-pro: 0.4351851851851852; observed 2026-11-13T05:10:48.813Z; Evidence sha256:38c1e2e8d782551d3dd986ed00bb82d130436cf6f0a1eda2b88e6b2d3d756e9c.
- artificial-analysis:aa-briefcase:deepseek-v4-pro-0424: 0.23938679245283018; observed 2026-11-13T05:10:48.813Z; Evidence sha256:6720d279086137149852def7af853432e292fd483fbd07b0f91505ad5df6a4a9.
- artificial-analysis:aa-briefcase:deepseek-v4-pro-non-reasoning: 0.27639751552795033; observed 2026-11-13T05:10:48.813Z; Evidence sha256:162096d302b5473b0de93923d26c07ad195f938f6617fb13299781aba4b3caaf.
- artificial-analysis:aa-briefcase:gemini-3-1-flash-lite-preview: 0.06332992849846783; observed 2026-11-13T05:10:48.813Z; Evidence sha256:50118559c001aaa1bd9a2cc41b4682ae2a14c2955abf01ba50c61f4384e5ec5b.
- artificial-analysis:aa-briefcase:gemini-3-1-pro-preview: 0.12424242424242424; observed 2026-11-13T05:10:48.813Z; Evidence sha256:383a0f06783d97251fae10fc910c42bea0c90483c3b825a8dd56fd00009bcc32.
- artificial-analysis:aa-briefcase:gemini-3-5-flash: 0.2773207990599295; observed 2026-11-13T05:10:48.813Z; Evidence sha256:65829f3407350d6e02773d3a1ad5a5661fd7c647bd59d18f1c727107f861f5cd.
- artificial-analysis:aa-briefcase:gemini-3-5-flash-lite: 0.1484848484848485; observed 2026-11-13T05:10:48.813Z; Evidence sha256:80866f62e0fbc94688fbdc3d92b901104340ba3558d320273898418bc364a123.
- artificial-analysis:aa-briefcase:gemini-3-5-flash-medium: 0.27635619242579323; observed 2026-11-13T05:10:48.813Z; Evidence sha256:d9a12e665bc7f88c453c2ab5821e7d9b833ba2a216fd6c01a0892b07c5767de7.
- artificial-analysis:aa-briefcase:gemini-3-6-flash: 0.2808080808080808; observed 2026-11-13T05:10:48.813Z; Evidence sha256:3087ba3b8823f6a7218fe87d5cb5746ff1218c594275d3b44a04403046d4b6c1.
- artificial-analysis:aa-briefcase:gemini-3-7-flash: 0.36363636363636365; observed 2026-11-13T05:10:48.813Z; Evidence sha256:79b9140889574f6cdbd4659a82d5aaf806e78eceb1235619242e234d4f7b9784.
- artificial-analysis:aa-briefcase:gemini-3-8-flash: 0.4212121212121212; observed 2026-11-13T05:10:48.813Z; Evidence sha256:84af22c260f66b77ca056887319e63bde690476209bb6cd1d90c602a4f4e5c64.
- artificial-analysis:aa-briefcase:gemini-3-8-flash-low: 0.35454545454545455; observed 2026-11-13T05:10:48.813Z; Evidence sha256:4e8c3ebfaa16882208b1f159f4999b95ef1eb15509ff1512667b4e993c524545.
- artificial-analysis:aa-briefcase:gemini-3-8-flash-medium: 0.4111111111111111; observed 2026-11-13T05:10:48.813Z; Evidence sha256:08707c2d819f4ef3a1dc82f4b4d20f429b0eadb872595125dc50bdbae5dbf60a.
- artificial-analysis:aa-briefcase:gemini-4-argon: 0.6463414634146342; observed 2026-11-13T05:10:48.813Z; Evidence sha256:b8991c3e63dd6e37eafb61885cb1cd5abf009d82c390188970ee43931de4d59e.
- artificial-analysis:aa-briefcase:gemini-4-carbon-low: 0.601010101010101; observed 2026-11-13T05:10:48.813Z; Evidence sha256:9d10d154580593e3b9b28ff90e5bd581f2560664655c364b4a383ec8ed8865e0.
- artificial-analysis:aa-briefcase:gemini-4-carbon-medium: 0.6232323232323232; observed 2026-11-13T05:10:48.813Z; Evidence sha256:c5f6210fce924efee807252bee0089729a44d4fe347f84c7e57c2da885d0235d.
- artificial-analysis:aa-briefcase:gemini-4-hydrogen-high: 0.5242424242424243; observed 2026-11-13T05:10:48.813Z; Evidence sha256:78f8790a5264d26308964ba497cf88c5300af1d549a340c9d398ba12d1762224.
- artificial-analysis:aa-briefcase:gemini-4-hydrogen-low: 0.2222222222222222; observed 2026-11-13T05:10:48.813Z; Evidence sha256:9bec8802b5f33ed2b985e0d7d63f0e42b9566b0fad79e1160aee86b5ff9a267c.
- artificial-analysis:aa-briefcase:gemini-4-hydrogen-medium: 0.4262626262626263; observed 2026-11-13T05:10:48.813Z; Evidence sha256:dd9d47dbd5f6a5b2a391e09b3ce24f06e767f9a1578eae1801ec08dff5766171.
- artificial-analysis:aa-briefcase:gemma-4-31b: 0.07777777777777778; observed 2026-11-13T05:10:48.813Z; Evidence sha256:225ae66819bf694eb65a00fcf8db9498cbc47def7dede27eb3999f25c7052023.
- artificial-analysis:aa-briefcase:glm-5-1: 0.25757575757575757; observed 2026-11-13T05:10:48.813Z; Evidence sha256:2e1852c4993a73191337efbdb741a7169315cc82c36077186b5cfc78250cbafd.
- artificial-analysis:aa-briefcase:glm-5-2: 0.3606060606060606; observed 2026-11-13T05:10:48.813Z; Evidence sha256:0c34eeca6ff9329ebbc1ca1970b2115b1a91ce19d03159e069f312469b127318.
- artificial-analysis:aa-briefcase:glm-5-3-flash: 0.4635897435897436; observed 2026-11-13T05:10:48.813Z; Evidence sha256:cb678a2eac50ca82cbc194c9f1a7e07b9f76df9c8b3bb28bab2f4a6b96a6cb99.
- artificial-analysis:aa-briefcase:glm-5-3-low: 0.37731958762886597; observed 2026-11-13T05:10:48.813Z; Evidence sha256:1d366f87905179194b75c2fedb8d27209350e364c251bf7a4d8dbbbb7c8e62d5.
- artificial-analysis:aa-briefcase:gpt-5-4-mini: 0.1254355400696864; observed 2026-11-13T05:10:48.813Z; Evidence sha256:8590adcf9fa17128799c8b7da9d78bcc49f0ce22be4d25cd0bcb28c8a3a88e26.
- artificial-analysis:aa-briefcase:gpt-5-4-nano: 0.14621676891615543; observed 2026-11-13T05:10:48.813Z; Evidence sha256:95c2ddd306b885507ce2e4e66883c8bd615fe5595870c7798a17f81218917e0e.
- artificial-analysis:aa-briefcase:gpt-5-5: 0.33438818565400846; observed 2026-11-13T05:10:48.813Z; Evidence sha256:9a243c4afbfb1222bb2ffa703b036885ef38bcb5ba0b4ef54316fc2145d6de6d.
- artificial-analysis:aa-briefcase:gpt-5-5-high: 0.30606060606060603; observed 2026-11-13T05:10:48.813Z; Evidence sha256:c8ea30bbbf4671a7c0cc1814c1f2e387cb4220c0966ee786dcd55fbc2f6ddda7.
- artificial-analysis:aa-briefcase:gpt-5-5-medium: 0.26565656565656565; observed 2026-11-13T05:10:48.813Z; Evidence sha256:bed3d7d07716c4a06e2e626a048ec47aea3f1bedfcf92fc5e1ab94403b220545.
- artificial-analysis:aa-briefcase:gpt-5-6-luna: 0.3797979797979798; observed 2026-11-13T05:10:48.813Z; Evidence sha256:c42f14b106c061123177215a888687885efdbf17d84eab2008ffebaacb4cec37.
- artificial-analysis:aa-briefcase:gpt-5-6-luna-high: 0.298989898989899; observed 2026-11-13T05:10:48.813Z; Evidence sha256:1a1463460e62e40f4c6322d898da03f7b7778c15d2f9e66d88c88fae7f93f1be.
- artificial-analysis:aa-briefcase:gpt-5-6-luna-low: 0.13079299691040164; observed 2026-11-13T05:10:48.813Z; Evidence sha256:d59c8d3eb5ef08958f30891a3369d0e0fe02dc3d8734779aa6506348ccec09a9.
- artificial-analysis:aa-briefcase:gpt-5-6-luna-medium: 0.20202020202020202; observed 2026-11-13T05:10:48.813Z; Evidence sha256:8cab46e0d7256014dd5055bca93ed96d93869bd1c516b84775fb4514286fd2ae.
- artificial-analysis:aa-briefcase:gpt-5-6-luna-non-reasoning: 0.12857142857142856; observed 2026-11-13T05:10:48.813Z; Evidence sha256:2e62e3f2776c07d820a8484a96f99bfccf3063ada90d2a3c686e5889a453792e.
- artificial-analysis:aa-briefcase:gpt-5-6-luna-xhigh: 0.3484848484848485; observed 2026-11-13T05:10:48.813Z; Evidence sha256:10f1e1ecf18366d12c8d1e9cd0d042c1d74dbbb6863b4e4fc9542448dc6f1d14.
- artificial-analysis:aa-briefcase:gpt-5-6-sol: 0.4184839044652129; observed 2026-11-13T05:10:48.813Z; Evidence sha256:8a71441e00caa5f5bd0e9e3dd7023c912d8f657153eb50dbfce900c0d8204a09.
- artificial-analysis:aa-briefcase:gpt-5-6-sol-high: 0.38585858585858585; observed 2026-11-13T05:10:48.813Z; Evidence sha256:9a0da0c7a45c54b37b66a96b3597a32513abea57a9b8a691f514893d3d213059.
- artificial-analysis:aa-briefcase:gpt-5-6-sol-low: 0.23939393939393938; observed 2026-11-13T05:10:48.813Z; Evidence sha256:c41c092b66d8e35074fc7c5186c0e61a11301a24c28ab3708fa558e336a2219b.
- artificial-analysis:aa-briefcase:gpt-5-6-sol-medium: 0.3181818181818182; observed 2026-11-13T05:10:48.813Z; Evidence sha256:9bb2f95880be940ce68460a3ca3b0fe99b45edcdfcc2b556b53c8e37d4df9c52.
- artificial-analysis:aa-briefcase:gpt-5-6-sol-non-reasoning: 0.2383838383838384; observed 2026-11-13T05:10:48.813Z; Evidence sha256:077ecb26c50de89570cffb5660e3c0764c8c5738de5d835e354d3934e248ed5c.
- artificial-analysis:aa-briefcase:gpt-5-6-sol-xhigh: 0.4131313131313131; observed 2026-11-13T05:10:48.813Z; Evidence sha256:c24498eb4923e127f76c623a94bb2b84b83c1b4196d1edd67ef38551d8247b39.
- artificial-analysis:aa-briefcase:gpt-5-6-terra: 0.3414141414141414; observed 2026-11-13T05:10:48.813Z; Evidence sha256:be37e162a093282c0dcae3df01244f1b0bacc354493204bdc4ebfc7e9828097f.
- artificial-analysis:aa-briefcase:gpt-5-6-terra-high: 0.29797979797979796; observed 2026-11-13T05:10:48.813Z; Evidence sha256:8ac702dc0bd05d00007e58987533c9bb6eae7347ac6af34719fa158316c32e1f.
- artificial-analysis:aa-briefcase:gpt-5-6-terra-low: 0.23333333333333334; observed 2026-11-13T05:10:48.813Z; Evidence sha256:cccd3442d18bda8647e1a2cb628ab053eb46d32f573b4126cf8193fa7942809b.
- artificial-analysis:aa-briefcase:gpt-5-6-terra-medium: 0.2202020202020202; observed 2026-11-13T05:10:48.813Z; Evidence sha256:195c0aa5316bc621ea8463c7cfb49c1cb498f63ba1b9c959b9f2f909f2b54722.
- artificial-analysis:aa-briefcase:gpt-5-6-terra-non-reasoning: 0.2111111111111111; observed 2026-11-13T05:10:48.813Z; Evidence sha256:4899bf0b1e73228f8f86c4a10e48ed6b6eb2ee9f1319d38cd2ad73633126fcb2.
- artificial-analysis:aa-briefcase:gpt-5-6-terra-xhigh: 0.35353535353535354; observed 2026-11-13T05:10:48.813Z; Evidence sha256:477851ed6b9e3b3b7040e278a7b0f7116837d12fa0b2f40381f2ccb8bc1f6c44.
- artificial-analysis:aa-briefcase:gpt-6-1-sol-high: 0.4909090909090909; observed 2026-11-13T05:10:48.813Z; Evidence sha256:6ff9ac8d632522c5fbe63e61f2370089996533646fee295b3eea952efb648b84.
- artificial-analysis:aa-briefcase:gpt-6-1-sol-low: 0.3333333333333333; observed 2026-11-13T05:10:48.813Z; Evidence sha256:810858b25a6ba4bd1c890ec6283dc8fd4c5b55032de8451e3135530e87ee9f1f.
- artificial-analysis:aa-briefcase:gpt-6-1-sol-medium: 0.4404040404040404; observed 2026-11-13T05:10:48.813Z; Evidence sha256:2bf6cbbf8304b3960a2cd829f5a965847f6db9acbfc9b20ed0c14bc4c651471d.
- artificial-analysis:aa-briefcase:gpt-6-1-sol-xhigh: 0.5161616161616162; observed 2026-11-13T05:10:48.813Z; Evidence sha256:cc6d302c5d7704d04de69a189e32a1239159ecf55e8090adeab13b9dbdeb432d.
- artificial-analysis:aa-briefcase:gpt-6-1-terra-high: 0.37676767676767675; observed 2026-11-13T05:10:48.813Z; Evidence sha256:ad064e9d242bcc19eb5940c8675c085617e8164ec11afec89205dfc9173c77ff.
- artificial-analysis:aa-briefcase:gpt-6-1-terra-low: 0.2808080808080808; observed 2026-11-13T05:10:48.813Z; Evidence sha256:da1e6fad9ac3d42a9e8601a87ecd8edf5b992e807905ee7f86abbc990ccc3c05.
- artificial-analysis:aa-briefcase:gpt-6-1-terra-medium: 0.33636363636363636; observed 2026-11-13T05:10:48.813Z; Evidence sha256:0be93682072b4179bb9ab7aece16b985f0a315370fbe1699eed3844645f22fff.
- artificial-analysis:aa-briefcase:gpt-6-1-terra-non-reasoning: 0.36464646464646466; observed 2026-11-13T05:10:48.813Z; Evidence sha256:4d89eee39943f89f323228a8f1ddc046663b41e6b5e2f29fc02add918f1517fc.
- artificial-analysis:aa-briefcase:gpt-6-1-terra-xhigh: 0.4080808080808081; observed 2026-11-13T05:10:48.813Z; Evidence sha256:3773638effecee0244618cee75b3eb5eb6d8dbee13be57f1fc807d03c42bb057.
- artificial-analysis:aa-briefcase:gpt-6-astra-high: 0.5080808080808081; observed 2026-11-13T05:10:48.813Z; Evidence sha256:e5154956d75ce2c4906af37b2d5e9bf4131f2c624c55988405276ec0931d6d2c.
- artificial-analysis:aa-briefcase:gpt-6-astra-low: 0.402020202020202; observed 2026-11-13T05:10:48.813Z; Evidence sha256:9bc7bb33c8a1086e26d83123bd7538d5f2b6afef735f05965c33d27b44b8f7e9.
- artificial-analysis:aa-briefcase:gpt-6-astra-medium: 0.47474747474747475; observed 2026-11-13T05:10:48.813Z; Evidence sha256:41800e80e84c9c2271aaff24380ef627318ff252c2ed2a51099a5265a7baba65.
- artificial-analysis:aa-briefcase:gpt-6-astra-xhigh: 0.5232323232323233; observed 2026-11-13T05:10:48.813Z; Evidence sha256:ebff17cac8938079dad58e9984105ceea68f32ddfc4f869365511da9d8a69dec.
- artificial-analysis:aa-briefcase:gpt-6-luna-high: 0.3181818181818182; observed 2026-11-13T05:10:48.813Z; Evidence sha256:672cfcc31bf071f845187abbb538f1007f136b9fd630783e63132058291870b4.
- artificial-analysis:aa-briefcase:gpt-6-luna-low: 0.14444444444444443; observed 2026-11-13T05:10:48.813Z; Evidence sha256:c2d03ad09f6813b01cbbc152c680191b2de64e996050abc49cd303cd1c9ba129.
- artificial-analysis:aa-briefcase:gpt-6-luna-medium: 0.2808080808080808; observed 2026-11-13T05:10:48.813Z; Evidence sha256:521fcc22407a1b7cf37e70390b5bc3b602a76ed25eb6adff7f51045cfd8ff702.
- artificial-analysis:aa-briefcase:gpt-6-luna-non-reasoning: 0.21313131313131314; observed 2026-11-13T05:10:48.813Z; Evidence sha256:bc89571ba5486be56596a854109a6eabd4b1357242f043d1ab6dbd7c253b1aa7.
- artificial-analysis:aa-briefcase:gpt-6-luna-xhigh: 0.33636363636363636; observed 2026-11-13T05:10:48.813Z; Evidence sha256:9073dca5f6182f4863aeb86625628595eba2e3e282932924311bf035f04e9c60.
- artificial-analysis:aa-briefcase:gpt-6-sol: 0.4626262626262626; observed 2026-11-13T05:10:48.813Z; Evidence sha256:d92efa08cc21fad6be0cd074309ea84f30d334f61851f62cbe445b857fd254ca.
- artificial-analysis:aa-briefcase:gpt-6-sol-high: 0.3787878787878788; observed 2026-11-13T05:10:48.813Z; Evidence sha256:0c4102684e0b2d64c57f346d92882666db16065a091a593934597d5e37c3d00b.
- artificial-analysis:aa-briefcase:gpt-6-sol-low: 0.20202020202020202; observed 2026-11-13T05:10:48.813Z; Evidence sha256:3b03201c764e94bc45eb396629ec7edc50e925d197dfea1c23fd2948a0c03c1d.
- artificial-analysis:aa-briefcase:gpt-6-sol-medium: 0.32626262626262625; observed 2026-11-13T05:10:48.813Z; Evidence sha256:ba7bb091744cb8a4820cab6cdc38ae2488f45edd56cd342c7697d50a09c24b16.
- artificial-analysis:aa-briefcase:gpt-6-sol-non-reasoning: 0.32222222222222224; observed 2026-11-13T05:10:48.813Z; Evidence sha256:f42fc7924462dfa2af500f5f214369363d55a0290470ac365f7d277a1bcd3907.
- artificial-analysis:aa-briefcase:gpt-6-sol-xhigh: 0.4171717171717172; observed 2026-11-13T05:10:48.813Z; Evidence sha256:b04cc5374cbfae97a841324d32e294c1c22be66570b07106fce8bbe007e32a71.
- artificial-analysis:aa-briefcase:granite-4-2-8b: 0.07272727272727272; observed 2026-11-13T05:10:48.813Z; Evidence sha256:02cd6556c4d6fc10f3ff2d2a29bce69b2a9496203ad0835e0327a0c10ddca6c1.
- artificial-analysis:aa-briefcase:grok-4-3: 0.17272727272727273; observed 2026-11-13T05:10:48.813Z; Evidence sha256:b2f6b055c06b2a5089b1d21d27ea2bd437ffb870bb10b6a077945fb1845242e7.
- artificial-analysis:aa-briefcase:grok-4-3-non-reasoning: 0.1404040404040404; observed 2026-11-13T05:10:48.813Z; Evidence sha256:da0966543f4dff3f22d42e8e65c1c2fa4f6febf5c2a5a307fa8757d95f5eec99.
- artificial-analysis:aa-briefcase:grok-4-5: 0.4070707070707071; observed 2026-11-13T05:10:48.813Z; Evidence sha256:ba738c8071cbcbf91b99b4924c844f236246255e21d550dae82b64963309ac82.
- artificial-analysis:aa-briefcase:grok-4-6: 0.5282828282828282; observed 2026-11-13T05:10:48.813Z; Evidence sha256:1e0d53831f21463d28278d0a0208da64d3dbb5ddd37b3e0f4f266b1dff095be5.
- artificial-analysis:aa-briefcase:grok-4-6-low: 0.402020202020202; observed 2026-11-13T05:10:48.813Z; Evidence sha256:f16e3489162a5417179eba43f1c20351c497d08f2ba3edb1c55bda8bc5b6e475.
- artificial-analysis:aa-briefcase:grok-4-6-medium: 0.5252525252525253; observed 2026-11-13T05:10:48.813Z; Evidence sha256:a10c0b595f933b77e15f9c92940db7c6c69490fabf83a00f1d814d93e2a19409.
- artificial-analysis:aa-briefcase:grok-4-6-xhigh: 0.5383838383838384; observed 2026-11-13T05:10:48.813Z; Evidence sha256:448341dee158ad2f93346fc3476ac2e07159b7cf8e11368e773ffae1dec31595.
- artificial-analysis:aa-briefcase:grok-4-7-high: 0.5501022494887525; observed 2026-11-13T05:10:48.813Z; Evidence sha256:60a93f70ee19c4cc48fcb6b34197ca6541f0eb5249d62fc98c0a4b7ca13fe379.
- artificial-analysis:aa-briefcase:grok-4-7-low: 0.49292929292929294; observed 2026-11-13T05:10:48.813Z; Evidence sha256:c2bb78f383f93f7de559f33fa0ae9b0548ff095532f144f443cbb88d30906de0.
- artificial-analysis:aa-briefcase:inkling: 0.19292929292929292; observed 2026-11-13T05:10:48.813Z; Evidence sha256:f90e7fe40e900d5842518d31eb4b91c5c8169cec2afb4ea36ec166a734f93f66.
- artificial-analysis:aa-briefcase:inkling-small: 0.2; observed 2026-11-13T05:10:48.813Z; Evidence sha256:30134dddf317dcf3f8149a56e753bc50a7c4f9bbe24a08032aa8bddaab3d3f78.
- artificial-analysis:aa-briefcase:kimi-k2-6: 0.20606060606060606; observed 2026-11-13T05:10:48.813Z; Evidence sha256:9688f74ddc085098e69271cfcf86c23ec67c73095ac096b5e3da23d51a9bb215.
- artificial-analysis:aa-briefcase:kimi-k3: 0.5097236438075742; observed 2026-11-13T05:10:48.813Z; Evidence sha256:1b6c8fe7a5b2d0c3d1b79b0d9a188437c5e0932cc856fbf8344fd4f47a420573.
- artificial-analysis:aa-briefcase:kimi-k3-low: 0.2606060606060606; observed 2026-11-13T05:10:48.813Z; Evidence sha256:88ce9b42ac91896ec05d2f9315a56cb7925ecbfac8d55ad5109d4bd0eaff1ae6.
- artificial-analysis:aa-briefcase:ling-3-0-flash-fin: 0.23535353535353534; observed 2026-11-13T05:10:48.813Z; Evidence sha256:27a6e1d0536194096803db1f292c8028b07a960d3aafc5adaeae0bf21fb5f8ec.
- artificial-analysis:aa-briefcase:mimo-v2-5-pro: 0.21414141414141413; observed 2026-11-13T05:10:48.813Z; Evidence sha256:babfa64b7d5171e814f4255ccab608126926a339cd500a9c1854dd8f4050d717.
- artificial-analysis:aa-briefcase:mimo-v2-6-flash: 0.5179119754350051; observed 2026-11-13T05:10:48.813Z; Evidence sha256:fd142558ff3312243ebf02218c3f7067448f16f05928ebf030532ad32080ebb8.
- artificial-analysis:aa-briefcase:minimax-m2-7: 0.1414141414141414; observed 2026-11-13T05:10:48.813Z; Evidence sha256:7e23440facf72bd2f17a46fbbe634950e86e9b3fef02a1edda28f9ad4e7e6e5f.
- artificial-analysis:aa-briefcase:minimax-m3: 0.30303030303030304; observed 2026-11-13T05:10:48.813Z; Evidence sha256:12d8515cef53b420a881ea51670ede65ae757e357ad25206b68feef5a0a02c87.
- artificial-analysis:aa-briefcase:minimax-m3-1-flash: 0.4780388151174668; observed 2026-11-13T05:10:48.813Z; Evidence sha256:4980396608ee698a48d9efcd4906cc62a94d66d3354a8bf22ad3cfb15c2498b9.
- artificial-analysis:aa-briefcase:mistral-large-4-medium: 0.38585858585858585; observed 2026-11-13T05:10:48.813Z; Evidence sha256:ce25e82e54ace79d687bb05ef21e6961d182e15bfa6f887403830fae8996770a.
- artificial-analysis:aa-briefcase:mistral-large-4-preview: 0.45151515151515154; observed 2026-11-13T05:10:48.813Z; Evidence sha256:3ab7478d645c316d31ed546ed9bb36ec9143688c27b916080ec3f421b372d58c.
- artificial-analysis:aa-briefcase:mistral-medium-3-5: 0.12424242424242424; observed 2026-11-13T05:10:48.813Z; Evidence sha256:8020fa1a4a7f24c0d77145e7562397d52b4a769f37b62244e845b7a19b735248.
- artificial-analysis:aa-briefcase:mistral-small-4: 0.05656565656565657; observed 2026-11-13T05:10:48.813Z; Evidence sha256:fd142558ff3312243ebf02218c3f7067448f16f05928ebf030532ad32080ebb8.
- artificial-analysis:aa-briefcase:muse-ember-xhigh: 0.5686868686868687; observed 2026-11-13T05:10:48.813Z; Evidence sha256:959a957f3a27a3bdef31a29fb29e0c8d8a09185f8c424d7370608a5039a45c23.
- artificial-analysis:aa-briefcase:muse-glimmer: 0.11514522821576763; observed 2026-11-13T05:10:48.813Z; Evidence sha256:f44b1e744d5888905e1d327e51ceb0dd1a77ebf3de59dc8d6144323f6d48fc8a.
- artificial-analysis:aa-briefcase:muse-spark: 0.16767676767676767; observed 2026-11-13T05:10:48.813Z; Evidence sha256:e1ead47bf7e7f633999a552cdf452e5faec966100a3b9463c35e94a68f338625.
- artificial-analysis:aa-briefcase:muse-spark-1-2: 0.45151515151515154; observed 2026-11-13T05:10:48.813Z; Evidence sha256:f99e780ada08a9736c2ff8adeef83b88576c58bc155272e585f0cae677b8e6c2.
- artificial-analysis:aa-briefcase:muse-spark-1-3: 0.5868686868686869; observed 2026-11-13T05:10:48.813Z; Evidence sha256:53563f170d44a4320f469a72a4f21519540d3959376dd90f1a12b11ad936fe50.
- artificial-analysis:aa-briefcase:muse-spark-1-3-xhigh: 0.5161616161616162; observed 2026-11-13T05:10:48.813Z; Evidence sha256:4f32fab2e138977118afd670bd9a30ae738b5233a9a19f7322b0c1b8564a82ab.
- artificial-analysis:aa-briefcase:muse-spark-open: 0.45656565656565656; observed 2026-11-13T05:10:48.813Z; Evidence sha256:28b7729d29229fa5016b933d551c4161ceb2717be0e70773da13a77478ee0f8c.
- artificial-analysis:aa-briefcase:muse-wonder-high: 0.5747474747474748; observed 2026-11-13T05:10:48.813Z; Evidence sha256:296080ec0d3555e17268d5abc16ae2395c34d5db43300c38faec383c366b934c.
- artificial-analysis:aa-briefcase:nanbeige4-3-33b: 0.35555555555555557; observed 2026-11-13T05:10:48.813Z; Evidence sha256:d3e61afd3352cfd55dfc214dcd8c41a29eceb617277725fc87ba501e566f9eb6.
- artificial-analysis:aa-briefcase:nemotron-3-5-lightning: 0.08888888888888889; observed 2026-11-13T05:10:48.813Z; Evidence sha256:fd142558ff3312243ebf02218c3f7067448f16f05928ebf030532ad32080ebb8.
- artificial-analysis:aa-briefcase:north-mini-code: 0.06230847803881512; observed 2026-11-13T05:10:48.813Z; Evidence sha256:fd142558ff3312243ebf02218c3f7067448f16f05928ebf030532ad32080ebb8.
- artificial-analysis:aa-briefcase:nvidia-nemotron-3-ultra-550b-a55b: 0.2202020202020202; observed 2026-11-13T05:10:48.813Z; Evidence sha256:85e89fe347b5388610a326af241f8ba523bc800ae20b726eb2280e0ee3fd682c.
- artificial-analysis:aa-briefcase:qwen3-5-122b-a10b: 0.10606060606060606; observed 2026-11-13T05:10:48.813Z; Evidence sha256:e589218d38c8192a0f5091b7d1ce218aa07f3cfe8d331fd1d2a1790704969087.
- artificial-analysis:aa-briefcase:qwen3-5-397b-a17b: 0.12121212121212122; observed 2026-11-13T05:10:48.813Z; Evidence sha256:6a9d03114bf7c53388e3fcc045f8103300b4bc9acd9b20045210d127f8ac3e1b.
- artificial-analysis:aa-briefcase:qwen3-7-max: 0.23737373737373738; observed 2026-11-13T05:10:48.813Z; Evidence sha256:b17de0569660e012a5b1a724c8e0c659c6b9ed730782900e830d9e4c8f4b6e39.
- artificial-analysis:aa-briefcase:qwen3-7-plus: 0.22828282828282828; observed 2026-11-13T05:10:48.813Z; Evidence sha256:40d6f10cb2466f74e9b59f0c1a93e93291110ae9be4bcb0827ddad7838b93e29.
- artificial-analysis:aa-briefcase:qwen3-8-2-4t-a95b: 0.5; observed 2026-11-13T05:10:48.813Z; Evidence sha256:e8dc08f811ba3d3e69207567daa0e5213b6c146031f71b01b4d5d45cc9d44e20.
- artificial-analysis:aa-briefcase:qwen3-8-27b-low: 0.4207818930041152; observed 2026-11-13T05:10:48.813Z; Evidence sha256:c07f63058f6b3f1eb8d7d7d9d9e8ed3c4dfef9c8b3d9292797c3704f38bd87f2.
- artificial-analysis:aa-briefcase:qwen3-8-27b-medium: 0.4652631578947368; observed 2026-11-13T05:10:48.813Z; Evidence sha256:c3f63cf02960a097db8ad1eb4ccaabdfda6dac6fe80922183df5b57e725e6fc1.
- artificial-analysis:aa-briefcase:qwen3-8-27b-non-reasoning: 0.2489539748953975; observed 2026-11-13T05:10:48.813Z; Evidence sha256:94f3ac41dac360361b30ccd4092b9df02d65581e3e8b4f3cd6068ed88a570f27.
- artificial-analysis:aa-briefcase:qwen3-8-flash-next: 0.5410010649627263; observed 2026-11-13T05:10:48.813Z; Evidence sha256:cbc77c23d1e74471ea79f81687c2174d31de77e9dd0cc73bfa6d29671ffde338.
- artificial-analysis:aa-briefcase:solar-pro4: 0.3354908306364617; observed 2026-11-13T05:10:48.813Z; Evidence sha256:fd142558ff3312243ebf02218c3f7067448f16f05928ebf030532ad32080ebb8.
- artificial-analysis:aa-briefcase:step-5: 0.4777777777777778; observed 2026-11-13T05:10:48.813Z; Evidence sha256:5ec64a86f036998fb64c1d9314757e3d7a75358075fe448ebf61ea564b2892bb.

## Visible comparison

- Fresh rendered models page catalog total: 742
- Unique profiles across the captured models, evaluation, and model-detail payloads: 288
- Result: scopes differ. The catalog total includes models outside the selected evaluation pages; it is recorded for visual validation but is not used to synthesize missing score rows.

## Snapshot delta

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| Unique source profiles | 286 | 288 | +2 |
| Active source profiles | 275 | 278 | +3 |
| Candidate results | 3240 | 3283 | +43 |
| Materialized costs | 362 | 367 | +5 |

Previous content-addressed artifacts remain preserved; this report compares the prior tracked snapshot with the refreshed snapshot.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `artificial-analysis`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Beam 1.0 | `artificial-analysis:aa-briefcase:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:aa-lcr:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:aa-omniscience:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:aa-omniscience:reflection-beam:index` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:critpt-v2:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:critpt:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:frontier-code-2-0:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:gdp-pdf:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:gdpval-aa:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:hle-diamond:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:humanitys-last-exam:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:reflection-beam-1-0-aa-index:intelligence-index-v5-0-1` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:scicode:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:terminal-bench-4-0:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Beam 1.0 | `artificial-analysis:terminal-bench-science:reflection-beam` | — | `max` | frontier-code | frontier-code:frontier-code-2-0:beam-1-0-max |
| Gemini 3.1 Pro Preview | `artificial-analysis:aa-briefcase:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:aa-lcr:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:apex-agents:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:critpt:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:gdp-pdf:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:gdpval-aa:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:gpqa-diamond:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:hle-diamond:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:humanitys-last-exam:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:ifbench:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:scicode:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:tau3-banking:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:terminal-bench-2-1:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.1 Pro Preview | `artificial-analysis:terminal-bench-4-0:gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-briefcase:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-lcr:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-omniscience:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:aa-omniscience:gemini-3-5-flash-lite:index` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:critpt-v2:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:critpt:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:frontier-code-2-0:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:gdp-pdf:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:gdpval-aa:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:google-gemini-3-5-flash-lite-aa-index:intelligence-index-v5-0-1` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:gpqa-diamond:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:hle-diamond:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:humanitys-last-exam:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:scicode:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:tau3-banking:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:terminal-bench-2-1:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:terminal-bench-4-0:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| Gemini 3.5 Flash-Lite | `artificial-analysis:terminal-bench-science:gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| GLM-5.1 (Reasoning) | `artificial-analysis:aa-briefcase:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:aa-lcr:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:critpt:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:gdp-pdf:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:gdpval-aa:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:gpqa-diamond:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:humanitys-last-exam:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:ifbench:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:scicode:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:tau3-banking:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:terminal-bench-2-1:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| GLM-5.1 (Reasoning) | `artificial-analysis:terminal-bench-4-0:glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-103:1-0-6 |
| Inkling 2 Small | `artificial-analysis:aa-briefcase:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:aa-lcr:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:aa-omniscience:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:aa-omniscience:inkling-2-small:index` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:critpt-v2:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:frontier-code-2-0:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:gdp-pdf:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:gdpval-aa:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:hle-diamond:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:humanitys-last-exam:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:scicode:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:tau3-banking:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:terminal-bench-2-1:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:terminal-bench-4-0:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:terminal-bench-science:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `artificial-analysis:thinking-machines-inkling-2-small-aa-index:intelligence-index-v5-0-1` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Kimi K3.1 Pro | `artificial-analysis:aa-briefcase:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-2 |
| Kimi K3.1 Pro | `artificial-analysis:aa-lcr:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-2 |
| Kimi K3.1 Pro | `artificial-analysis:aa-omniscience:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-2 |
| Kimi K3.1 Pro | `artificial-analysis:aa-omniscience:kimi-k3-1-pro:index` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-2 |
| Kimi K3.1 Pro | `artificial-analysis:critpt-v2:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-2 |
| Kimi K3.1 Pro | `artificial-analysis:critpt:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-2 |
| Kimi K3.1 Pro | `artificial-analysis:frontier-code-2-0:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-2 |
| Kimi K3.1 Pro | `artificial-analysis:gdp-pdf:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-2 |
| Kimi K3.1 Pro | `artificial-analysis:gdpval-aa:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-2 |
| Kimi K3.1 Pro | `artificial-analysis:hle-diamond:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-2 |
| Kimi K3.1 Pro | `artificial-analysis:humanitys-last-exam:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-2 |
| Kimi K3.1 Pro | `artificial-analysis:mka:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-2 |
| Kimi K3.1 Pro | `artificial-analysis:moonshot-kimi-k3-1-pro-aa-index:intelligence-index-v5-0-1` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-2 |
| Kimi K3.1 Pro | `artificial-analysis:scicode:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-2 |
| Kimi K3.1 Pro | `artificial-analysis:terminal-bench-4-0:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-2 |
| Kimi K3.1 Pro | `artificial-analysis:terminal-bench-science:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-2 |
| MiniMax-M3 | `artificial-analysis:aa-briefcase:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `artificial-analysis:aa-lcr:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `artificial-analysis:aa-omniscience:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `artificial-analysis:aa-omniscience:minimax-m3:index` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `artificial-analysis:critpt-v2:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `artificial-analysis:critpt:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `artificial-analysis:frontier-code-2-0:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `artificial-analysis:gdp-pdf:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `artificial-analysis:gdpval-aa:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `artificial-analysis:gpqa-diamond:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `artificial-analysis:hle-diamond:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `artificial-analysis:humanitys-last-exam:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `artificial-analysis:ifbench:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `artificial-analysis:minimax-minimax-m3-aa-index:intelligence-index-v5-0-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `artificial-analysis:scicode:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `artificial-analysis:tau3-banking:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `artificial-analysis:terminal-bench-2-1:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `artificial-analysis:terminal-bench-4-0:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| MiniMax-M3 | `artificial-analysis:terminal-bench-science:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| Qwen3.8 Max | `artificial-analysis:aa-lcr:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:critpt:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:gdp-pdf:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:gdpval-aa:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:gpqa-diamond:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:humanitys-last-exam:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:scicode:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:tau3-banking:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:terminal-bench-2-1:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max | `artificial-analysis:terminal-bench-4-0:qwen3-8-max-0803` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:aa-briefcase:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:aa-lcr:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:aa-omniscience:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:aa-omniscience:qwen3-8-max:index` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:alibaba-qwen3-8-max-aa-index:intelligence-index-v5-0-1` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:apex-agents:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:critpt-v2:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:critpt:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:frontier-code-2-0:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:gdp-pdf:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:gdpval-aa:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:gpqa-diamond:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:hle-diamond:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:humanitys-last-exam:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:mka:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:scicode:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:tau3-banking:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:terminal-bench-2-1:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:terminal-bench-4-0:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen3.8 Max (0902) | `artificial-analysis:terminal-bench-science:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Qwen4 Max | `artificial-analysis:aa-briefcase:qwen4-max` | — | `xhigh` | livebench | livebench-2026-11-06:livebench-browser:qwen4-max |
| Qwen4 Max | `artificial-analysis:aa-omniscience:qwen4-max` | — | `xhigh` | livebench | livebench-2026-11-06:livebench-browser:qwen4-max |
| Qwen4 Max | `artificial-analysis:aa-omniscience:qwen4-max:index` | — | `xhigh` | livebench | livebench-2026-11-06:livebench-browser:qwen4-max |
| Qwen4 Max | `artificial-analysis:alibaba-qwen4-max-aa-index:intelligence-index-v5-0-1` | — | `xhigh` | livebench | livebench-2026-11-06:livebench-browser:qwen4-max |
| Qwen4 Max | `artificial-analysis:apex-agents:qwen4-max` | — | `xhigh` | livebench | livebench-2026-11-06:livebench-browser:qwen4-max |
| Qwen4 Max | `artificial-analysis:critpt-v2:qwen4-max` | — | `xhigh` | livebench | livebench-2026-11-06:livebench-browser:qwen4-max |
| Qwen4 Max | `artificial-analysis:frontier-code-2-0:qwen4-max` | — | `xhigh` | livebench | livebench-2026-11-06:livebench-browser:qwen4-max |
| Qwen4 Max | `artificial-analysis:gdp-pdf:qwen4-max` | — | `xhigh` | livebench | livebench-2026-11-06:livebench-browser:qwen4-max |
| Qwen4 Max | `artificial-analysis:gdpval-aa:qwen4-max` | — | `xhigh` | livebench | livebench-2026-11-06:livebench-browser:qwen4-max |
| Qwen4 Max | `artificial-analysis:hle-diamond:qwen4-max` | — | `xhigh` | livebench | livebench-2026-11-06:livebench-browser:qwen4-max |
| Qwen4 Max | `artificial-analysis:terminal-bench-4-0:qwen4-max` | — | `xhigh` | livebench | livebench-2026-11-06:livebench-browser:qwen4-max |
| Qwen4 Max | `artificial-analysis:terminal-bench-science:qwen4-max` | — | `xhigh` | livebench | livebench-2026-11-06:livebench-browser:qwen4-max |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Agnes 2.5 Pro Theta | `artificial-analysis:aa-briefcase:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:aa-lcr:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:aa-omniscience:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:aa-omniscience:agnes-2-5-pro-theta:index` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:agnes-agnes-2-5-pro-theta-aa-index:intelligence-index-v5-0-1` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:critpt-v2:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:critpt:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:frontier-code-2-0:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:gdp-pdf:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:gdpval-aa:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:hle-diamond:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:humanitys-last-exam:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:scicode:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:terminal-bench-4-0:agnes-2-5-pro-theta` | — | `default` | — | — |
| Agnes 2.5 Pro Theta | `artificial-analysis:terminal-bench-science:agnes-2-5-pro-theta` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:aa-briefcase:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:aa-lcr:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:aa-omniscience:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:aa-omniscience:granite-4-2-8b:index` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:critpt:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:frontier-code-2-0:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:gdp-pdf:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:gdpval-aa:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:gpqa-diamond:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:hle-diamond:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:humanitys-last-exam:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:ibm-granite-4-2-8b-aa-index:intelligence-index-v5-0-1` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:scicode:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:tau3-banking:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:terminal-bench-2-1:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:terminal-bench-4-0:granite-4-2-8b` | — | `default` | — | — |
| Granite 4.2 8B | `artificial-analysis:terminal-bench-science:granite-4-2-8b` | — | `default` | — | — |
| K-EXAONE 2.0 | `artificial-analysis:aa-lcr:k-exaone-2-0` | — | `default` | — | — |
| K-EXAONE 2.0 | `artificial-analysis:aa-omniscience:k-exaone-2-0` | — | `default` | — | — |
| K-EXAONE 2.0 | `artificial-analysis:aa-omniscience:k-exaone-2-0:index` | — | `default` | — | — |
| K-EXAONE 2.0 | `artificial-analysis:critpt:k-exaone-2-0` | — | `default` | — | — |
| K-EXAONE 2.0 | `artificial-analysis:frontier-code-2-0:k-exaone-2-0` | — | `default` | — | — |
| K-EXAONE 2.0 | `artificial-analysis:gdp-pdf:k-exaone-2-0` | — | `default` | — | — |
| K-EXAONE 2.0 | `artificial-analysis:gdpval-aa:k-exaone-2-0` | — | `default` | — | — |
| K-EXAONE 2.0 | `artificial-analysis:gpqa-diamond:k-exaone-2-0` | — | `default` | — | — |
| K-EXAONE 2.0 | `artificial-analysis:hle-diamond:k-exaone-2-0` | — | `default` | — | — |
| K-EXAONE 2.0 | `artificial-analysis:humanitys-last-exam:k-exaone-2-0` | — | `default` | — | — |
| K-EXAONE 2.0 | `artificial-analysis:lg-k-exaone-2-0-aa-index:intelligence-index-v5-0-1` | — | `default` | — | — |
| K-EXAONE 2.0 | `artificial-analysis:scicode:k-exaone-2-0` | — | `default` | — | — |
| K-EXAONE 2.0 | `artificial-analysis:tau3-banking:k-exaone-2-0` | — | `default` | — | — |
| K-EXAONE 2.0 | `artificial-analysis:terminal-bench-2-1:k-exaone-2-0` | — | `default` | — | — |
| K-EXAONE 2.0 | `artificial-analysis:terminal-bench-4-0:k-exaone-2-0` | — | `default` | — | — |
| K-EXAONE 2.0 | `artificial-analysis:terminal-bench-science:k-exaone-2-0` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:aa-briefcase:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:aa-lcr:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:apex-agents:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:critpt:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:gdp-pdf:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:gdpval-aa:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:gpqa-diamond:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:humanitys-last-exam:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:ifbench:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:scicode:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:tau3-banking:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:terminal-bench-2-1:kimi-k2-6` | — | `default` | — | — |
| Kimi K2.6 (Reasoning) | `artificial-analysis:terminal-bench-4-0:kimi-k2-6` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:aa-briefcase:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:aa-lcr:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:apex-agents:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:critpt:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:gdp-pdf:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:gdpval-aa:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:gpqa-diamond:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:humanitys-last-exam:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:ifbench:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:scicode:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:tau3-banking:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:terminal-bench-2-1:mimo-v2-5-pro` | — | `default` | — | — |
| MiMo-V2.5-Pro (Reasoning) | `artificial-analysis:terminal-bench-4-0:mimo-v2-5-pro` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:aa-briefcase:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:aa-lcr:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:critpt:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:gdpval-aa:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:gpqa-diamond:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:humanitys-last-exam:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:ifbench:muse-spark` | — | `default` | — | — |
| Muse Spark | `artificial-analysis:terminal-bench-2-1:muse-spark` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:aa-briefcase:nanbeige4-3-33b` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:aa-omniscience:nanbeige4-3-33b` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:aa-omniscience:nanbeige4-3-33b:index` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:frontier-code-2-0:nanbeige4-3-33b` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:gdp-pdf:nanbeige4-3-33b` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:hle-diamond:nanbeige4-3-33b` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:nanbeige-nanbeige4-3-33b-aa-index:intelligence-index-v5-0-1` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:terminal-bench-4-0:nanbeige4-3-33b` | — | `default` | — | — |
| Nanbeige4.3-33B | `artificial-analysis:terminal-bench-science:nanbeige4-3-33b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-briefcase:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-lcr:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-omniscience:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:aa-omniscience:nvidia-nemotron-3-ultra-550b-a55b:index` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:critpt-v2:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:critpt:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:frontier-code-2-0:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:gdp-pdf:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:gdpval-aa:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:gpqa-diamond:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:hle-diamond:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:humanitys-last-exam:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:ifbench:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:nvidia-nemotron-3-ultra-aa-index:intelligence-index-v5-0-1` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:scicode:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:tau3-banking:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:terminal-bench-2-1:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:terminal-bench-4-0:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| Nemotron 3 Ultra 550B A55B (Reasoning) | `artificial-analysis:terminal-bench-science:nvidia-nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:aa-briefcase:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:aa-lcr:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:aa-omniscience:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:aa-omniscience:north-mini-code:index` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:cohere-north-mini-code-1-0-aa-index:intelligence-index-v5-0-1` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:critpt:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:frontier-code-2-0:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:gdp-pdf:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:gdpval-aa:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:gpqa-diamond:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:hle-diamond:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:humanitys-last-exam:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:ifbench:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:scicode:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:tau3-banking:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:terminal-bench-2-1:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:terminal-bench-4-0:north-mini-code` | — | `default` | — | — |
| North Mini Code | `artificial-analysis:terminal-bench-science:north-mini-code` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:aa-briefcase:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:aa-lcr:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:critpt:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:gdp-pdf:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:gdpval-aa:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:gpqa-diamond:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:humanitys-last-exam:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:ifbench:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:scicode:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:tau3-banking:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:terminal-bench-2-1:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Max | `artificial-analysis:terminal-bench-4-0:qwen3-7-max` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:aa-briefcase:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:aa-lcr:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:apex-agents:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:critpt:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:gdp-pdf:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:gdpval-aa:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:gpqa-diamond:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:hle-diamond:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:humanitys-last-exam:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:ifbench:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:scicode:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:tau3-banking:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:terminal-bench-2-1:qwen3-7-plus` | — | `default` | — | — |
| Qwen3.7 Plus | `artificial-analysis:terminal-bench-4-0:qwen3-7-plus` | — | `default` | — | — |
| Tencent Hy4 | `artificial-analysis:aa-briefcase:tencent-hy4` | — | `default` | — | — |
| Tencent Hy4 | `artificial-analysis:aa-omniscience:tencent-hy4` | — | `default` | — | — |
| Tencent Hy4 | `artificial-analysis:aa-omniscience:tencent-hy4:index` | — | `default` | — | — |
| Tencent Hy4 | `artificial-analysis:critpt-v2:tencent-hy4` | — | `default` | — | — |
| Tencent Hy4 | `artificial-analysis:frontier-code-2-0:tencent-hy4` | — | `default` | — | — |
| Tencent Hy4 | `artificial-analysis:gdp-pdf:tencent-hy4` | — | `default` | — | — |
| Tencent Hy4 | `artificial-analysis:hle-diamond:tencent-hy4` | — | `default` | — | — |
| Tencent Hy4 | `artificial-analysis:tencent-hy4-aa-index:intelligence-index-v5-0-1` | — | `default` | — | — |
| Tencent Hy4 | `artificial-analysis:terminal-bench-4-0:tencent-hy4` | — | `default` | — | — |
| Tencent Hy4 | `artificial-analysis:terminal-bench-science:tencent-hy4` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
