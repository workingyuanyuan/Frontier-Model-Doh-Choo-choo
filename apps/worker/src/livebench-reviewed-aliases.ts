import type { LiveBenchAliasManifestEntry } from './livebench-alias-manifest.js';

interface IdentitySeed {
  readonly slug: string;
  readonly displayName: string;
}

interface ReviewedAliasGroup {
  readonly provider: IdentitySeed;
  readonly family: IdentitySeed;
  readonly model: IdentitySeed;
  readonly aliases: readonly string[];
  readonly evidenceUrls: readonly string[];
}

function aliasSlug(alias: string): string {
  return alias
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '');
}

function entriesForGroup(
  group: ReviewedAliasGroup,
): readonly LiveBenchAliasManifestEntry[] {
  return group.aliases.map((alias) => ({
    provider: group.provider,
    family: group.family,
    model: group.model,
    variant: {
      slug: aliasSlug(alias),
      displayName: alias,
    },
    aliases: [alias],
    evidenceUrls: group.evidenceUrls,
  }));
}

const anthropic = { slug: 'anthropic', displayName: 'Anthropic' };
const openAi = { slug: 'openai', displayName: 'OpenAI' };
const google = { slug: 'google', displayName: 'Google' };
const deepSeek = { slug: 'deepseek', displayName: 'DeepSeek' };
const alibaba = { slug: 'alibaba', displayName: 'Alibaba Cloud' };
const meta = { slug: 'meta', displayName: 'Meta' };
const microsoft = { slug: 'microsoft', displayName: 'Microsoft' };
const mistral = { slug: 'mistral', displayName: 'Mistral AI' };
const xAi = { slug: 'xai', displayName: 'xAI' };
const perplexity = { slug: 'perplexity', displayName: 'Perplexity' };

const anthropicEvidence = [
  'https://docs.anthropic.com/en/docs/about-claude/models/overview',
];
const openAiEvidence = ['https://developers.openai.com/api/docs/models/all'];
const geminiEvidence = ['https://ai.google.dev/gemini-api/docs/changelog'];
const gemmaEvidence = ['https://ai.google.dev/gemma/docs'];
const deepSeekR1Evidence = ['https://github.com/deepseek-ai/DeepSeek-R1'];
const deepSeekV3Evidence = ['https://github.com/deepseek-ai/DeepSeek-V3'];
const deepSeekCoderEvidence = [
  'https://github.com/deepseek-ai/DeepSeek-Coder',
  'https://github.com/deepseek-ai/DeepSeek-Coder-V2',
];
const qwenEvidence = ['https://github.com/QwenLM/Qwen'];
const qwen2Evidence = ['https://qwenlm.github.io/blog/qwen2/'];
const qwen25Evidence = ['https://qwenlm.github.io/blog/qwen2.5/'];
const qwenMathEvidence = ['https://github.com/QwenLM/Qwen2.5-Math'];
const qwqEvidence = ['https://github.com/QwenLM/QwQ'];
const llamaEvidence = ['https://github.com/meta-llama/llama-models'];
const phiEvidence = ['https://huggingface.co/collections/microsoft/phi-3'];
const mistralEvidence = ['https://docs.mistral.ai/models/'];
const xAiEvidence = ['https://docs.x.ai/docs/models'];
const perplexityEvidence = ['https://docs.perplexity.ai/docs/sonar/models'];

const groups: readonly ReviewedAliasGroup[] = [
  {
    provider: anthropic,
    family: { slug: 'claude-3', displayName: 'Claude 3' },
    model: { slug: 'claude-3-7-sonnet', displayName: 'Claude 3.7 Sonnet' },
    aliases: [
      'claude-3-7-sonnet-20250219-base',
      'claude-3-7-sonnet-20250219-thinking-25k',
      'claude-3-7-sonnet-20250219-thinking-64k',
    ],
    evidenceUrls: anthropicEvidence,
  },
  {
    provider: anthropic,
    family: { slug: 'claude-3', displayName: 'Claude 3' },
    model: { slug: 'claude-3-5-sonnet', displayName: 'Claude 3.5 Sonnet' },
    aliases: ['claude-3-5-sonnet-20240620'],
    evidenceUrls: anthropicEvidence,
  },
  {
    provider: anthropic,
    family: { slug: 'claude-3', displayName: 'Claude 3' },
    model: { slug: 'claude-3-haiku', displayName: 'Claude 3 Haiku' },
    aliases: ['claude-3-haiku-20240307'],
    evidenceUrls: anthropicEvidence,
  },
  {
    provider: anthropic,
    family: { slug: 'claude-3', displayName: 'Claude 3' },
    model: { slug: 'claude-3-sonnet', displayName: 'Claude 3 Sonnet' },
    aliases: ['claude-3-sonnet-20240229'],
    evidenceUrls: anthropicEvidence,
  },
  {
    provider: openAi,
    family: { slug: 'gpt-4o', displayName: 'GPT-4o' },
    model: { slug: 'chatgpt-4o', displayName: 'ChatGPT-4o' },
    aliases: [
      'chatgpt-4o-latest-2025-01-29',
      'chatgpt-4o-latest-2025-01-30',
      'chatgpt-4o-latest-2025-03-27',
    ],
    evidenceUrls: openAiEvidence,
  },
  {
    provider: openAi,
    family: { slug: 'gpt-4-5', displayName: 'GPT-4.5' },
    model: { slug: 'gpt-4-5-preview', displayName: 'GPT-4.5 Preview' },
    aliases: ['gpt-4.5-preview-2025-02-27'],
    evidenceUrls: openAiEvidence,
  },
  {
    provider: openAi,
    family: { slug: 'gpt-4o', displayName: 'GPT-4o' },
    model: { slug: 'gpt-4o', displayName: 'GPT-4o' },
    aliases: ['gpt-4o-2024-05-13'],
    evidenceUrls: openAiEvidence,
  },
  {
    provider: openAi,
    family: { slug: 'gpt-4', displayName: 'GPT-4' },
    model: { slug: 'gpt-4', displayName: 'GPT-4' },
    aliases: [
      'gpt-4-0613',
      'gpt-4-1106-preview',
      'gpt-4-0125-preview',
      'gpt-4-turbo-2024-04-09',
    ],
    evidenceUrls: openAiEvidence,
  },
  {
    provider: openAi,
    family: { slug: 'gpt-3-5', displayName: 'GPT-3.5' },
    model: { slug: 'gpt-3-5-turbo', displayName: 'GPT-3.5 Turbo' },
    aliases: ['gpt-3.5-turbo-0125', 'gpt-3.5-turbo-1106'],
    evidenceUrls: openAiEvidence,
  },
  {
    provider: openAi,
    family: { slug: 'o1', displayName: 'o1' },
    model: { slug: 'o1', displayName: 'o1' },
    aliases: [
      'o1',
      'o1-preview-2024-09-12',
      'o1-2024-12-17-low',
      'o1-2024-12-17-medium',
      'o1-2024-12-17-high',
    ],
    evidenceUrls: openAiEvidence,
  },
  {
    provider: openAi,
    family: { slug: 'o3', displayName: 'o3' },
    model: { slug: 'o3-mini', displayName: 'o3-mini' },
    aliases: [
      'o3-mini-2025-01-31-low',
      'o3-mini-2025-01-31-medium',
      'o3-mini-2025-01-31-high',
    ],
    evidenceUrls: openAiEvidence,
  },
  {
    provider: { slug: 'cohere', displayName: 'Cohere' },
    family: { slug: 'command-r', displayName: 'Command R' },
    model: { slug: 'command-r', displayName: 'Command R' },
    aliases: ['command-r-03-2024'],
    evidenceUrls: ['https://docs.cohere.com/docs/models'],
  },
  {
    provider: { slug: 'cohere', displayName: 'Cohere' },
    family: { slug: 'command-r', displayName: 'Command R' },
    model: { slug: 'command-r-plus', displayName: 'Command R+' },
    aliases: ['command-r-plus-04-2024'],
    evidenceUrls: ['https://docs.cohere.com/docs/models'],
  },
  {
    provider: google,
    family: { slug: 'gemini-1-5', displayName: 'Gemini 1.5' },
    model: { slug: 'gemini-1-5-pro', displayName: 'Gemini 1.5 Pro' },
    aliases: [
      'gemini-1.5-pro-001',
      'gemini-1.5-pro-exp-0801',
      'gemini-1.5-pro-exp-0827',
    ],
    evidenceUrls: geminiEvidence,
  },
  {
    provider: google,
    family: { slug: 'gemini-1-5', displayName: 'Gemini 1.5' },
    model: { slug: 'gemini-1-5-flash', displayName: 'Gemini 1.5 Flash' },
    aliases: [
      'gemini-1.5-flash-001',
      'gemini-1.5-flash-002',
      'gemini-1.5-flash-exp-0827',
    ],
    evidenceUrls: geminiEvidence,
  },
  {
    provider: google,
    family: { slug: 'gemini-1-5', displayName: 'Gemini 1.5' },
    model: { slug: 'gemini-1-5-flash-8b', displayName: 'Gemini 1.5 Flash-8B' },
    aliases: [
      'gemini-1.5-flash-8b-001',
      'gemini-1.5-flash-8b-exp-0827',
      'gemini-1.5-flash-8b-exp-0924',
    ],
    evidenceUrls: geminiEvidence,
  },
  {
    provider: google,
    family: { slug: 'gemini-2', displayName: 'Gemini 2' },
    model: { slug: 'gemini-2-flash', displayName: 'Gemini 2.0 Flash' },
    aliases: [
      'gemini-2.0-flash',
      'gemini-2.0-flash-001',
      'gemini-2.0-flash-exp',
    ],
    evidenceUrls: geminiEvidence,
  },
  {
    provider: google,
    family: { slug: 'gemini-2', displayName: 'Gemini 2' },
    model: {
      slug: 'gemini-2-flash-lite',
      displayName: 'Gemini 2.0 Flash-Lite',
    },
    aliases: [
      'gemini-2.0-flash-lite-001',
      'gemini-2.0-flash-lite-preview-02-05',
    ],
    evidenceUrls: geminiEvidence,
  },
  {
    provider: google,
    family: { slug: 'gemini-2', displayName: 'Gemini 2' },
    model: {
      slug: 'gemini-2-flash-thinking',
      displayName: 'Gemini 2.0 Flash Thinking',
    },
    aliases: [
      'gemini-2.0-flash-thinking-exp-1219',
      'gemini-2.0-flash-thinking-exp-01-21',
    ],
    evidenceUrls: geminiEvidence,
  },
  {
    provider: google,
    family: { slug: 'gemini-2', displayName: 'Gemini 2' },
    model: { slug: 'gemini-2-pro', displayName: 'Gemini 2.0 Pro' },
    aliases: ['gemini-2.0-pro-exp-02-05'],
    evidenceUrls: geminiEvidence,
  },
  {
    provider: google,
    family: { slug: 'gemini-2-5', displayName: 'Gemini 2.5' },
    model: { slug: 'gemini-2-5-pro', displayName: 'Gemini 2.5 Pro' },
    aliases: ['gemini-2.5-pro-exp-03-25'],
    evidenceUrls: geminiEvidence,
  },
  {
    provider: google,
    family: { slug: 'gemini-experimental', displayName: 'Gemini Experimental' },
    model: { slug: 'gemini-experimental', displayName: 'Gemini Experimental' },
    aliases: ['gemini-exp-1114', 'gemini-exp-1121', 'gemini-exp-1206'],
    evidenceUrls: geminiEvidence,
  },
  {
    provider: google,
    family: { slug: 'learnlm', displayName: 'LearnLM' },
    model: { slug: 'learnlm-1-5-pro', displayName: 'LearnLM 1.5 Pro' },
    aliases: ['learnlm-1.5-pro-experimental'],
    evidenceUrls: geminiEvidence,
  },
  {
    provider: google,
    family: { slug: 'gemma-1', displayName: 'Gemma 1' },
    model: { slug: 'gemma-1-1', displayName: 'Gemma 1.1' },
    aliases: ['gemma-1.1-7b-it'],
    evidenceUrls: gemmaEvidence,
  },
  {
    provider: google,
    family: { slug: 'gemma-2', displayName: 'Gemma 2' },
    model: { slug: 'gemma-2', displayName: 'Gemma 2' },
    aliases: ['gemma-2-9b-it', 'gemma-2-27b-it'],
    evidenceUrls: gemmaEvidence,
  },
  {
    provider: google,
    family: { slug: 'gemma-3', displayName: 'Gemma 3' },
    model: { slug: 'gemma-3', displayName: 'Gemma 3' },
    aliases: ['gemma-3-4b-it', 'gemma-3-12b-it', 'gemma-3-27b-it'],
    evidenceUrls: gemmaEvidence,
  },
  {
    provider: deepSeek,
    family: { slug: 'deepseek-r1', displayName: 'DeepSeek R1' },
    model: { slug: 'deepseek-r1', displayName: 'DeepSeek R1' },
    aliases: [
      'deepseek-r1',
      'deepseek-r1-distill-qwen-32b',
      'deepseek-r1-distill-llama-70b',
    ],
    evidenceUrls: deepSeekR1Evidence,
  },
  {
    provider: deepSeek,
    family: { slug: 'deepseek-v3', displayName: 'DeepSeek V3' },
    model: { slug: 'deepseek-v3', displayName: 'DeepSeek V3' },
    aliases: ['deepseek-chat', 'deepseek-v3', 'deepseek-v3-0324'],
    evidenceUrls: deepSeekV3Evidence,
  },
  {
    provider: deepSeek,
    family: { slug: 'deepseek-coder', displayName: 'DeepSeek Coder' },
    model: { slug: 'deepseek-coder', displayName: 'DeepSeek Coder' },
    aliases: ['deepseek-coder', 'deepseek-coder-v2-lite-instruct'],
    evidenceUrls: deepSeekCoderEvidence,
  },
  {
    provider: deepSeek,
    family: { slug: 'deepseek-v2', displayName: 'DeepSeek V2' },
    model: { slug: 'deepseek-v2-lite', displayName: 'DeepSeek V2 Lite' },
    aliases: ['deepseek-v2-lite-chat'],
    evidenceUrls: ['https://github.com/deepseek-ai/DeepSeek-V2'],
  },
  {
    provider: alibaba,
    family: { slug: 'qwq', displayName: 'QwQ' },
    model: { slug: 'qwq-32b', displayName: 'QwQ 32B' },
    aliases: ['qwq-32b-preview', 'qwq-32b'],
    evidenceUrls: qwqEvidence,
  },
  {
    provider: alibaba,
    family: { slug: 'qwen-2-5', displayName: 'Qwen 2.5' },
    model: { slug: 'qwen-2-5', displayName: 'Qwen 2.5' },
    aliases: [
      'qwen2.5-7b-instruct-turbo',
      'qwen2.5-72b-instruct-turbo',
      'qwen2.5-coder-32b-instruct',
      'qwen2.5-max',
    ],
    evidenceUrls: qwen25Evidence,
  },
  {
    provider: alibaba,
    family: { slug: 'qwen-1-5', displayName: 'Qwen 1.5' },
    model: { slug: 'qwen-1-5-chat', displayName: 'Qwen 1.5 Chat' },
    aliases: [
      'qwen1.5-0.5b-chat',
      'qwen1.5-1.8b-chat',
      'qwen1.5-4b-chat',
      'qwen1.5-7b-chat',
      'qwen1.5-72b-chat',
      'qwen1.5-110b-chat',
    ],
    evidenceUrls: qwenEvidence,
  },
  {
    provider: alibaba,
    family: { slug: 'qwen-2', displayName: 'Qwen 2' },
    model: { slug: 'qwen-2-instruct', displayName: 'Qwen 2 Instruct' },
    aliases: [
      'qwen2-0.5b-instruct',
      'qwen2-1.5b-instruct',
      'qwen2-7b-instruct',
      'qwen2-72b-instruct',
    ],
    evidenceUrls: qwen2Evidence,
  },
  {
    provider: alibaba,
    family: { slug: 'qwen-2', displayName: 'Qwen 2' },
    model: { slug: 'qwen-2-math', displayName: 'Qwen 2 Math' },
    aliases: ['qwen2-math-72b-instruct'],
    evidenceUrls: qwenMathEvidence,
  },
  {
    provider: meta,
    family: { slug: 'llama-2', displayName: 'Llama 2' },
    model: { slug: 'llama-2-7b', displayName: 'Llama 2 7B' },
    aliases: ['llama-2-7b-chat-hf'],
    evidenceUrls: llamaEvidence,
  },
  {
    provider: meta,
    family: { slug: 'llama-3', displayName: 'Llama 3' },
    model: { slug: 'llama-3-instruct', displayName: 'Llama 3 Instruct' },
    aliases: ['meta-llama-3-8b-instruct', 'meta-llama-3-70b-instruct'],
    evidenceUrls: llamaEvidence,
  },
  {
    provider: meta,
    family: { slug: 'llama-3-1', displayName: 'Llama 3.1' },
    model: { slug: 'llama-3-1-instruct', displayName: 'Llama 3.1 Instruct' },
    aliases: [
      'meta-llama-3.1-8b-instruct-turbo',
      'meta-llama-3.1-70b-instruct-turbo',
      'meta-llama-3.1-405b-instruct-turbo',
    ],
    evidenceUrls: llamaEvidence,
  },
  {
    provider: meta,
    family: { slug: 'llama-3-3', displayName: 'Llama 3.3' },
    model: { slug: 'llama-3-3-70b', displayName: 'Llama 3.3 70B' },
    aliases: ['llama-3.3-70b-instruct-turbo'],
    evidenceUrls: llamaEvidence,
  },
  {
    provider: meta,
    family: { slug: 'llama-4', displayName: 'Llama 4' },
    model: { slug: 'llama-4-maverick', displayName: 'Llama 4 Maverick' },
    aliases: ['llama-4-maverick-17b-128e-instruct'],
    evidenceUrls: llamaEvidence,
  },
  {
    provider: microsoft,
    family: { slug: 'phi-3', displayName: 'Phi-3' },
    model: { slug: 'phi-3', displayName: 'Phi-3' },
    aliases: [
      'phi-3-mini-4k-instruct',
      'phi-3-mini-128k-instruct',
      'phi-3-small-8k-instruct',
      'phi-3-small-128k-instruct',
      'phi-3-medium-4k-instruct',
      'phi-3-medium-128k-instruct',
    ],
    evidenceUrls: phiEvidence,
  },
  {
    provider: microsoft,
    family: { slug: 'phi-3-5', displayName: 'Phi-3.5' },
    model: { slug: 'phi-3-5', displayName: 'Phi-3.5' },
    aliases: ['phi-3.5-mini-instruct', 'phi-3.5-moe-instruct'],
    evidenceUrls: phiEvidence,
  },
  {
    provider: microsoft,
    family: { slug: 'phi-4', displayName: 'Phi-4' },
    model: { slug: 'phi-4', displayName: 'Phi-4' },
    aliases: ['phi-4'],
    evidenceUrls: ['https://huggingface.co/microsoft/phi-4'],
  },
  {
    provider: mistral,
    family: { slug: 'mistral-7b', displayName: 'Mistral 7B' },
    model: { slug: 'mistral-7b-instruct', displayName: 'Mistral 7B Instruct' },
    aliases: ['mistral-7b-instruct-v0.2', 'mistral-7b-instruct-v0.3'],
    evidenceUrls: mistralEvidence,
  },
  {
    provider: mistral,
    family: { slug: 'mixtral', displayName: 'Mixtral' },
    model: { slug: 'mixtral-8x7b', displayName: 'Mixtral 8x7B' },
    aliases: ['mixtral-8x7b-instruct-v0.1', 'open-mixtral-8x7b'],
    evidenceUrls: mistralEvidence,
  },
  {
    provider: mistral,
    family: { slug: 'mixtral', displayName: 'Mixtral' },
    model: { slug: 'mixtral-8x22b', displayName: 'Mixtral 8x22B' },
    aliases: ['mixtral-8x22b-instruct-v0.1', 'open-mixtral-8x22b'],
    evidenceUrls: mistralEvidence,
  },
  {
    provider: mistral,
    family: { slug: 'mistral-large', displayName: 'Mistral Large' },
    model: { slug: 'mistral-large', displayName: 'Mistral Large' },
    aliases: [
      'mistral-large',
      'mistral-large-2402',
      'mistral-large-2407',
      'mistral-large-2411',
    ],
    evidenceUrls: mistralEvidence,
  },
  {
    provider: mistral,
    family: { slug: 'mistral-small', displayName: 'Mistral Small' },
    model: { slug: 'mistral-small', displayName: 'Mistral Small' },
    aliases: [
      'mistral-small-2402',
      'mistral-small-2409',
      'mistral-small-2501',
      'mistral-small-2503',
    ],
    evidenceUrls: mistralEvidence,
  },
  {
    provider: mistral,
    family: { slug: 'mistral-nemo', displayName: 'Mistral Nemo' },
    model: { slug: 'mistral-nemo', displayName: 'Mistral Nemo' },
    aliases: ['open-mistral-nemo'],
    evidenceUrls: mistralEvidence,
  },
  {
    provider: mistral,
    family: { slug: 'mathstral', displayName: 'Mathstral' },
    model: { slug: 'mathstral-7b', displayName: 'Mathstral 7B' },
    aliases: ['mathstral-7b-v0.1'],
    evidenceUrls: mistralEvidence,
  },
  {
    provider: xAi,
    family: { slug: 'grok-2', displayName: 'Grok 2' },
    model: { slug: 'grok-2', displayName: 'Grok 2' },
    aliases: ['grok-beta', 'grok-2', 'grok-2-1212'],
    evidenceUrls: [
      'https://x.ai/news/grok-1212',
      'https://docs.x.ai/developers/release-notes',
    ],
  },
  {
    provider: xAi,
    family: { slug: 'grok-2', displayName: 'Grok 2' },
    model: { slug: 'grok-2-mini', displayName: 'Grok 2 mini' },
    aliases: ['grok-2-mini'],
    evidenceUrls: ['https://x.ai/news/grok-2'],
  },
  {
    provider: xAi,
    family: { slug: 'grok-3', displayName: 'Grok 3' },
    model: { slug: 'grok-3', displayName: 'Grok 3' },
    aliases: ['grok-3', 'grok-3-beta', 'grok-3-mini-reasoning-beta'],
    evidenceUrls: xAiEvidence,
  },
  {
    provider: perplexity,
    family: { slug: 'sonar', displayName: 'Sonar' },
    model: { slug: 'sonar', displayName: 'Sonar' },
    aliases: ['sonar', 'sonar-pro', 'perplexity-sonar-reasoning'],
    evidenceUrls: perplexityEvidence,
  },
  {
    provider: { slug: 'stepfun', displayName: 'StepFun' },
    family: { slug: 'step-2', displayName: 'Step-2' },
    model: { slug: 'step-2-16k', displayName: 'Step-2 16K' },
    aliases: ['step-2-16k-202411'],
    evidenceUrls: ['https://platform.stepfun.com/docs/llm/text'],
  },
  {
    provider: { slug: 'soundai', displayName: 'SoundAI' },
    family: { slug: 'azerogpt', displayName: 'AzeroGPT' },
    model: { slug: 'azerogpt', displayName: 'AzeroGPT' },
    aliases: ['azerogpt'],
    evidenceUrls: ['https://azero.soundai.com/prod_azerogpt.html'],
  },
  {
    provider: { slug: 'tencent', displayName: 'Tencent' },
    family: { slug: 'hunyuan', displayName: 'Hunyuan' },
    model: { slug: 'hunyuan-turbos', displayName: 'Hunyuan TurboS' },
    aliases: ['hunyuan-turbos-20250313'],
    evidenceUrls: ['https://hunyuan.tencent.com/'],
  },
  {
    provider: { slug: 'ai2', displayName: 'Ai2' },
    family: { slug: 'olmo-2', displayName: 'OLMo 2' },
    model: { slug: 'olmo-2-13b', displayName: 'OLMo 2 13B' },
    aliases: ['olmo-2-1124-13b-instruct'],
    evidenceUrls: ['https://github.com/allenai/OLMo'],
  },
  {
    provider: { slug: 'nvidia', displayName: 'NVIDIA' },
    family: { slug: 'nemotron', displayName: 'Nemotron' },
    model: {
      slug: 'llama-3-1-nemotron-70b',
      displayName: 'Llama 3.1 Nemotron 70B',
    },
    aliases: [
      'llama-3.1-nemotron-70b-instruct',
      'llama-3.1-nemotron-70b-instruct-hf',
    ],
    evidenceUrls: [
      'https://huggingface.co/nvidia/Llama-3.1-Nemotron-70B-Instruct-HF',
    ],
  },
  {
    provider: { slug: 'abacus-ai', displayName: 'Abacus.AI' },
    family: { slug: 'dracarys-2', displayName: 'Dracarys 2' },
    model: { slug: 'dracarys-2', displayName: 'Dracarys 2' },
    aliases: ['dracarys2-72b-instruct', 'dracarys2-llama-3.1-70b-instruct'],
    evidenceUrls: ['https://huggingface.co/abacusai'],
  },
  {
    provider: { slug: 'nous-research', displayName: 'Nous Research' },
    family: { slug: 'hermes-3', displayName: 'Hermes 3' },
    model: { slug: 'hermes-3-70b', displayName: 'Hermes 3 70B' },
    aliases: ['hermes-3-llama-3.1-70b'],
    evidenceUrls: [
      'https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-70B',
    ],
  },
  {
    provider: { slug: 'teknium', displayName: 'Teknium' },
    family: { slug: 'openhermes', displayName: 'OpenHermes' },
    model: { slug: 'openhermes-2-5', displayName: 'OpenHermes 2.5' },
    aliases: ['openhermes-2.5-mistral-7b'],
    evidenceUrls: ['https://huggingface.co/teknium/OpenHermes-2.5-Mistral-7B'],
  },
  {
    provider: { slug: 'matt-shumer', displayName: 'Matt Shumer' },
    family: { slug: 'reflection', displayName: 'Reflection' },
    model: { slug: 'reflection-llama-3-1-70b', displayName: 'Reflection 70B' },
    aliases: ['reflection-llama-3.1-70b'],
    evidenceUrls: [
      'https://huggingface.co/mattshumer/Reflection-Llama-3.1-70B',
    ],
  },
  {
    provider: { slug: 'nova-sky', displayName: 'NovaSky' },
    family: { slug: 'sky-t1', displayName: 'Sky-T1' },
    model: { slug: 'sky-t1-32b', displayName: 'Sky-T1 32B' },
    aliases: ['sky-t1-32b-preview'],
    evidenceUrls: ['https://huggingface.co/NovaSky-AI/Sky-T1-32B-Preview'],
  },
  {
    provider: { slug: 'nexusflow', displayName: 'Nexusflow' },
    family: { slug: 'starling', displayName: 'Starling' },
    model: { slug: 'starling-lm-7b', displayName: 'Starling-LM 7B' },
    aliases: ['starling-lm-7b-beta'],
    evidenceUrls: ['https://huggingface.co/Nexusflow/Starling-LM-7B-beta'],
  },
  {
    provider: { slug: '01-ai', displayName: '01.AI' },
    family: { slug: 'yi', displayName: 'Yi' },
    model: { slug: 'yi-6b', displayName: 'Yi 6B' },
    aliases: ['yi-6b-chat'],
    evidenceUrls: ['https://huggingface.co/01-ai/Yi-6B-Chat'],
  },
  {
    provider: { slug: 'lmsys', displayName: 'LMSYS' },
    family: { slug: 'vicuna', displayName: 'Vicuna' },
    model: { slug: 'vicuna-7b-1-5', displayName: 'Vicuna 7B v1.5' },
    aliases: ['vicuna-7b-v1.5', 'vicuna-7b-v1.5-16k'],
    evidenceUrls: ['https://huggingface.co/lmsys/vicuna-7b-v1.5'],
  },
  {
    provider: { slug: 'hugging-face', displayName: 'Hugging Face' },
    family: { slug: 'zephyr', displayName: 'Zephyr' },
    model: { slug: 'zephyr-7b', displayName: 'Zephyr 7B' },
    aliases: ['zephyr-7b-alpha', 'zephyr-7b-beta'],
    evidenceUrls: ['https://huggingface.co/HuggingFaceH4/zephyr-7b-beta'],
  },
  {
    provider: { slug: 'abacus-ai', displayName: 'Abacus.AI' },
    family: { slug: 'smaug', displayName: 'Smaug' },
    model: { slug: 'smaug-qwen-2-72b', displayName: 'Smaug Qwen2 72B' },
    aliases: ['smaug-qwen2-72b-instruct'],
    evidenceUrls: ['https://huggingface.co/abacusai/Smaug-Qwen2-72B-Instruct'],
  },
];

export const reviewedLiveBenchAliasManifestEntries =
  groups.flatMap(entriesForGroup);
