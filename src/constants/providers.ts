import { AIProvider } from "../types/config";

export interface ProviderInfo {
  label: string;
  envVar: string;
  keyUrl?: string;
  /** Base URL of an OpenAI-compatible /v1 API. Absent = native API (gemini, claude) or user-supplied (custom). */
  baseUrl?: string;
  defaultModel: string;
}

export const PROVIDERS: Record<AIProvider, ProviderInfo> = {
  gemini: {
    label: "Gemini",
    envVar: "GEMINI_API_KEY",
    keyUrl: "https://aistudio.google.com/apikey",
    defaultModel: "gemini-2.5-flash",
  },
  openai: {
    label: "OpenAI",
    envVar: "OPENAI_API_KEY",
    keyUrl: "https://platform.openai.com/api-keys",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
  },
  claude: {
    label: "Claude (Anthropic)",
    envVar: "ANTHROPIC_API_KEY",
    keyUrl: "https://console.anthropic.com/settings/keys",
    defaultModel: "claude-opus-4-8",
  },
  openrouter: {
    label: "OpenRouter",
    envVar: "OPENROUTER_API_KEY",
    keyUrl: "https://openrouter.ai/keys",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4o-mini",
  },
  nim: {
    label: "NVIDIA NIM",
    envVar: "NVIDIA_API_KEY",
    keyUrl: "https://build.nvidia.com",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    defaultModel: "meta/llama-3.3-70b-instruct",
  },
  custom: {
    label: "Custom (OpenAI-compatible)",
    envVar: "CUSTOM_API_KEY",
    defaultModel: "",
  },
};

export const PROVIDER_NAMES = Object.keys(PROVIDERS) as AIProvider[];

export function isProvider(name: string): name is AIProvider {
  return name in PROVIDERS;
}

export function providerListText(): string {
  return PROVIDER_NAMES.join("/");
}
