import { ModelChoice } from "../constants/models";
import { CustomApiFlavor } from "../types/config";

const TIMEOUT_MS = 8000;
const NON_CHAT = /embed|whisper|tts|dall-e|audio|image|moderation|realtime/i;

export interface DetectedEndpoint {
  /** Normalized base URL — includes /v1 when that's where the API lives */
  baseUrl: string;
  api: CustomApiFlavor;
  models: ModelChoice[];
}

async function tryFetchJson(
  url: string,
  headers: Record<string, string>
): Promise<any | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// Decide the wire protocol from a /models response. Signals, in order:
//   1. supported_endpoint_types — explicit per-model declaration used by
//      proxies (freemodel, aerolink). "openai" wins when both are offered
//      since the OpenAI path is the more universal one.
//   2. owned_by: "anthropic" with no OpenAI signal → Anthropic.
//   3. display_name present (real Anthropic /v1/models shape) → Anthropic.
//   4. default → OpenAI.
function classifyFlavor(list: any[]): CustomApiFlavor {
  const types = new Set<string>();
  for (const m of list) {
    for (const t of m?.supported_endpoint_types ?? []) types.add(t);
  }
  if (types.size > 0) {
    if (types.has("openai")) return "openai";
    if (types.has("anthropic")) return "anthropic";
  }
  if (list.some((m: any) => m?.owned_by === "anthropic")) return "anthropic";
  if (list.some((m: any) => m?.display_name)) return "anthropic";
  return "openai";
}

function toModels(list: any[], api: CustomApiFlavor): ModelChoice[] {
  if (api === "anthropic") {
    return list
      .filter((m: any) => typeof m?.id === "string")
      .map((m: any) => ({ name: m.display_name || m.id, value: m.id }));
  }
  return list
    .map((m: any) => m?.id)
    .filter((id: any) => typeof id === "string" && !NON_CHAT.test(id))
    .sort()
    .map((id: string) => ({ name: id, value: id }));
}

// Probes {base}/models and {base}/v1/models with both auth styles, then
// classifies the endpoint's wire protocol from the model objects it returns.
export async function detectCustomEndpoint(
  baseUrl: string,
  apiKey: string
): Promise<DetectedEndpoint | null> {
  const root = baseUrl.replace(/\/+$/, "");
  const bases = root.endsWith("/v1") ? [root] : [root, `${root}/v1`];

  const headerSets: Record<string, string>[] = [
    apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    { "x-api-key": apiKey || "", "anthropic-version": "2023-06-01" },
  ];

  for (const b of bases) {
    for (const headers of headerSets) {
      const data = await tryFetchJson(`${b}/models`, headers);
      const list = data?.data;
      if (!Array.isArray(list) || list.length === 0) continue;

      const api = classifyFlavor(list);
      return { baseUrl: b, api, models: toModels(list, api) };
    }
  }
  return null;
}
