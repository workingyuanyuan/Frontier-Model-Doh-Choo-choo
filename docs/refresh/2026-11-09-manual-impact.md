# 新 benchmark 的手動比較與 cohort 影響

基準產品 `sha256:e52b966e9ff807047b8ce29f0cdb40b43e182162c77c00bd76314c83cacd0cea`。最終產品 `sha256:65896e20485508dd0731093e4186505e21bec094fa15679865e25683391c2e3c`。這是角色修正前的已驗證產品；最終版本 720ec5d5 採相同 benchmark、profiles、分數和成本，來源角色修正不改本報告的計算。

以 `apps/bench/lib/common-benchmarks.ts` 的 `buildCommonComparison` 計算，固定指定的模型與 effort，使用各版本 v2 mapping 及產品品質政策。Evidence 篩選只作用於記憶體副本。

## 手動比較

### GPT-5.6 Sol max 與 GPT-6 Luna max

共同 benchmark 33 → 35。新增 `biobasicsbench`、`maxxbench`。

| 模型與 effort     | 原名次 | 新名次 |    原總分 |    新總分 |      差值 |
| ----------------- | -----: | -----: | --------: | --------: | --------: |
| GPT-5.6 Sol · max |      1 |      1 | 63.645472 | 63.358059 | -0.287414 |
| GPT-6 Luna · max  |      2 |      2 | 52.557053 | 51.912686 | -0.644367 |

| 模型與 effort     | 固定舊 benchmark 的資料影響 | 直接加入新 benchmark | 後續共同集合與品質影響 |
| ----------------- | --------------------------: | -------------------: | ---------------------: |
| GPT-5.6 Sol · max |                   +0.000000 |            -0.287414 |              +0.000000 |
| GPT-6 Luna · max  |                   +0.000000 |            -0.644367 |              +0.000000 |

| 模型與 effort     | 新 Benchmark   |      分數 |
| ----------------- | -------------- | --------: |
| GPT-5.6 Sol · max | biobasicsbench | 45.563520 |
| GPT-5.6 Sol · max | maxxbench      | 69.101124 |
| GPT-6 Luna · max  | biobasicsbench | 37.562400 |
| GPT-6 Luna · max  | maxxbench      | 51.685393 |

### GPT-6 Astra xhigh 與 GPT-5.6 Sol max

共同 benchmark 13 → 16。新增 `aa-lcr`、`biobasicsbench`、`maxxbench`。

| 模型與 effort       | 原名次 | 新名次 |    原總分 |    新總分 |      差值 |
| ------------------- | -----: | -----: | --------: | --------: | --------: |
| GPT-6 Astra · xhigh |      1 |      1 | 58.042177 | 63.127456 | +5.085279 |
| GPT-5.6 Sol · max   |      2 |      2 | 52.110344 | 56.732263 | +4.621919 |

| 模型與 effort       | 固定舊 benchmark 的資料影響 | 直接加入新 benchmark | 後續共同集合與品質影響 |
| ------------------- | --------------------------: | -------------------: | ---------------------: |
| GPT-6 Astra · xhigh |                   +0.000000 |            +2.175045 |              +2.910234 |
| GPT-5.6 Sol · max   |                   +0.000000 |            +0.086849 |              +4.535070 |

| 模型與 effort       | 新 Benchmark   |      分數 |
| ------------------- | -------------- | --------: |
| GPT-6 Astra · xhigh | biobasicsbench | 66.685080 |
| GPT-6 Astra · xhigh | maxxbench      | 71.910112 |
| GPT-5.6 Sol · max   | biobasicsbench | 45.563520 |
| GPT-5.6 Sol · max   | maxxbench      | 69.101124 |

BioBasicsBench 讓理解維度的無限制共同測試由一項增加至兩項，既有受限測試 AA-LCR 隨之滿足兩項無限制測試的搭配門檻。理解維度權重亦由 ½ 增至 1。歸因表將直接新增及 AA-LCR 後續加入的影響分列。

### GPT-6 Astra max 與 GPT-6.1 Sol max

共同 benchmark 43 → 44。新增 `biobasicsbench`。

| 模型與 effort     | 原名次 | 新名次 |    原總分 |    新總分 |      差值 |
| ----------------- | -----: | -----: | --------: | --------: | --------: |
| GPT-6 Astra · max |      1 |      1 | 67.685677 | 67.849200 | +0.163523 |
| GPT-6.1 Sol · max |      2 |      2 | 66.451700 | 66.495707 | +0.044007 |

| 模型與 effort     | 固定舊 benchmark 的資料影響 | 直接加入新 benchmark | 後續共同集合與品質影響 |
| ----------------- | --------------------------: | -------------------: | ---------------------: |
| GPT-6 Astra · max |                   +0.000000 |            +0.163523 |              +0.000000 |
| GPT-6.1 Sol · max |                   +0.000000 |            +0.044007 |              +0.000000 |

| 模型與 effort     | 新 Benchmark   |      分數 |
| ----------------- | -------------- | --------: |
| GPT-6 Astra · max | biobasicsbench | 66.981760 |
| GPT-6.1 Sol · max | biobasicsbench | 62.614860 |

## 預設與其他 cohort

| 集合                | 模型數 | 舊共同測試數 | 新共同測試數 | 新 benchmark | 最大總分差 |
| ------------------- | -----: | -----------: | -----------: | ------------ | ---------: |
| aa-top-2            |      2 |           14 |           14 | 無           |   0.000000 |
| aa-top-3            |      3 |           14 |           14 | 無           |   0.000000 |
| aa-top-4            |      4 |           14 |           14 | 無           |   0.000000 |
| aa-top-5            |      5 |           14 |           14 | 無           |   0.000000 |
| aa-top-6            |      6 |           12 |           12 | 無           |   0.000000 |
| aa-top-7            |      7 |           12 |           12 | 無           |   0.000000 |
| aa-frontier（預設） |      8 |           12 |           12 | 無           |   0.000000 |
| aa-top-9            |      9 |           11 |           11 | 無           |   0.000000 |
| aa-top-10           |     10 |           11 |           11 | 無           |   0.000000 |

預設 cohort 的 MaxxBench 可用 profiles 為 Claude Opus 5.5 · max、Claude Sonnet 5.5 · max。BioBasicsBench 可用 profiles 為 GPT-6 Astra · max、GPT-6.1 Sol · max。兩者各自未覆蓋預設的全部 profiles。

各 cohort 使用其實際代表 profiles，並依 frontier generator 排除 comparisonOnly 測試後重新求交集，核對發布的共同 benchmark、排名與總分。完整 JSON 保存每個集合的新舊 profiles 與缺格原因。

前兩組手動比較均固定 profiles，差值不含模型集合切換。第三組的 Astra 使用 max，MaxxBench 的 Astra 成績歸在 xhigh。第二組的直接新增同時改變理解維度平均值與權重，AA-LCR 後續加入再改變平均值，各階段加總等於完整差值。
