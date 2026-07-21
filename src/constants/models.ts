export interface ModelChoice {
  name: string;
  value: string;
}

export const GEMINI_MODELS: ModelChoice[] = [
  { name: "Gemini 2.5 Flash (fast, free tier)", value: "gemini-2.5-flash" },
  { name: "Gemini 2.0 Flash (free tier)", value: "gemini-2.0-flash" },
  { name: "Gemini 2.0 Flash-Lite (free tier)", value: "gemini-2.0-flash-lite" },
  { name: "Gemini 2.5 Pro (paid only)", value: "gemini-2.5-pro" },
];

export const OPENAI_MODELS: ModelChoice[] = [
  { name: "GPT-4o Mini (fast, cheap)", value: "gpt-4o-mini" },
  { name: "GPT-4o (recommended)", value: "gpt-4o" },
  { name: "GPT-4.1", value: "gpt-4.1" },
  { name: "GPT-4.1 Mini", value: "gpt-4.1-mini" },
  { name: "o1 Mini (reasoning)", value: "o1-mini" },
  { name: "o1 (reasoning)", value: "o1" },
];

export const CLAUDE_MODELS: ModelChoice[] = [
  { name: "Claude Opus 4.8 (recommended)", value: "claude-opus-4-8" },
  { name: "Claude Sonnet 5", value: "claude-sonnet-5" },
  { name: "Claude Haiku 4.5 (fast, cheap)", value: "claude-haiku-4-5" },
];

export const OPENROUTER_MODELS: ModelChoice[] = [
  { name: "GPT-4o Mini (fast, cheap)", value: "openai/gpt-4o-mini" },
  { name: "Claude Sonnet 4.5", value: "anthropic/claude-sonnet-4.5" },
  { name: "Gemini 2.5 Flash", value: "google/gemini-2.5-flash" },
  { name: "Llama 3.3 70B", value: "meta-llama/llama-3.3-70b-instruct" },
  { name: "DeepSeek V3", value: "deepseek/deepseek-chat" },
];

export const NIM_MODELS: ModelChoice[] = [
  { name: "Llama 3.3 70B", value: "meta/llama-3.3-70b-instruct" },
  { name: "Llama 3.1 405B", value: "meta/llama-3.1-405b-instruct" },
  { name: "DeepSeek R1 (reasoning)", value: "deepseek-ai/deepseek-r1" },
  { name: "Mistral Large 2", value: "mistralai/mistral-large-2-instruct" },
];

// custom returns [] — callers fall back to a free-text model prompt
export function getModelsForProvider(provider: string): ModelChoice[] {
  switch (provider) {
    case "gemini":
      return GEMINI_MODELS;
    case "openai":
      return OPENAI_MODELS;
    case "claude":
      return CLAUDE_MODELS;
    case "openrouter":
      return OPENROUTER_MODELS;
    case "nim":
      return NIM_MODELS;
    default:
      return [];
  }
}
