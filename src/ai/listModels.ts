import { ModelChoice, getModelsForProvider } from "../constants/models";
import { AIProvider } from "../types/config";
import { getApiKeyForProvider } from "../utils/env";
import { loadConfig } from "../config/config";
import { resolveBaseUrl } from "./openai";

const TIMEOUT_MS = 10000;

// Non-chat OpenAI model ids we don't want in the picker
const NON_CHAT = /embed|whisper|tts|dall-e|audio|image|moderation|realtime/i;

async function fetchJson(
  url: string,
  headers: Record<string, string>
): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Model list request failed: ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchAvailableModels(
  provider: AIProvider
): Promise<ModelChoice[]> {
  switch (provider) {
    case "gemini": {
      const apiKey = getApiKeyForProvider("gemini");
      const data = await fetchJson(
        "https://generativelanguage.googleapis.com/v1beta/models?pageSize=200",
        { "x-goog-api-key": apiKey }
      );
      return (data.models ?? [])
        .filter((m: any) =>
          m.supportedGenerationMethods?.includes("generateContent")
        )
        .map((m: any) => ({
          name: m.displayName || m.name,
          value: String(m.name).replace(/^models\//, ""),
        }));
    }
    case "claude": {
      // Claude Code backend has no API key to list with — use the static list
      if (loadConfig().claudeBackend === "claude-code") {
        return getModelsForProvider("claude");
      }
      const apiKey = getApiKeyForProvider("claude");
      const data = await fetchJson(
        "https://api.anthropic.com/v1/models?limit=100",
        { "x-api-key": apiKey, "anthropic-version": "2023-06-01" }
      );
      return (data.data ?? []).map((m: any) => ({
        name: m.display_name || m.id,
        value: m.id,
      }));
    }
    default: {
      // openai / openrouter / nim / custom — GET {base}/models
      const apiKey = getApiKeyForProvider(provider);
      const data = await fetchJson(`${resolveBaseUrl(provider).replace(/\/+$/, "")}/models`, {
        Authorization: `Bearer ${apiKey}`,
      });
      return (data.data ?? [])
        .map((m: any) => m.id)
        .filter((id: any) => typeof id === "string" && !NON_CHAT.test(id))
        .sort()
        .map((id: string) => ({ name: id, value: id }));
    }
  }
}

// Live model list from the provider's API; falls back to the static
// list on any failure (offline, bad key, provider without /models).
export async function getModelChoices(
  provider: AIProvider
): Promise<ModelChoice[]> {
  try {
    const models = await fetchAvailableModels(provider);
    if (models.length > 0) return models;
  } catch {
    // fall through to static list
  }
  return getModelsForProvider(provider);
}
