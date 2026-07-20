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

export function getModelsForProvider(provider: string): ModelChoice[] {
  return provider === "gemini" ? GEMINI_MODELS : OPENAI_MODELS;
}
