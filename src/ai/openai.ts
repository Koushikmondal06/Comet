import { getApiKeyForProvider } from "../utils/env";
import { loadConfig } from "../config/config";
import { PROVIDERS } from "../constants/providers";
import { AIProvider } from "../types/config";
import { AIResponse } from "./provider";

const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000;
const RETRYABLE_STATUSES = [429, 500, 502, 503, 504];

const SYSTEM_PROMPT =
  "You are an expert git commit message generator. Always respond with valid JSON.";

// o1/o3-style reasoning models reject system messages, custom temperature,
// and max_tokens (they require max_completion_tokens)
function isReasoningModel(model: string): boolean {
  return /^o\d/.test(model);
}

function buildRequestBody(model: string, prompt: string, provider: AIProvider): Record<string, unknown> {
  let body: Record<string, unknown>;
  if (provider === "openai" && isReasoningModel(model)) {
    body = {
      messages: [{ role: "user", content: `${SYSTEM_PROMPT}\n\n${prompt}` }],
      max_completion_tokens: 8192,
    };
  } else {
    body = {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 8192,
    };
  }
  // Custom endpoints without a configured model use the server default
  if (model) body.model = model;
  return body;
}

export function resolveBaseUrl(provider: AIProvider): string {
  const registered = PROVIDERS[provider].baseUrl;
  if (registered) return registered;

  const baseUrl =
    process.env.CUSTOM_BASE_URL || loadConfig().customBaseUrl;
  if (!baseUrl) {
    throw new Error(
      "No base URL set for the custom provider. Run 'comet config' to set it (or export CUSTOM_BASE_URL)."
    );
  }
  return baseUrl;
}

// Serves openai, openrouter, nim, and custom — all OpenAI-compatible
// /chat/completions endpoints; only base URL and API key differ.
export async function generateWithOpenAI(
  prompt: string,
  model?: string,
  provider: AIProvider = "openai"
): Promise<AIResponse> {
  const info = PROVIDERS[provider];
  const apiKey = getApiKeyForProvider(provider);
  const actualModel =
    model ||
    (provider === "openai" ? process.env.OPENAI_MODEL : undefined) ||
    info.defaultModel ||
    loadConfig().model;

  // Custom endpoints may have a server-side default model; others need one
  if (!actualModel && provider !== "custom") {
    throw new Error(
      `No model configured for ${info.label}. Run 'comet config' to set one.`
    );
  }

  const url = `${resolveBaseUrl(provider).replace(/\/+$/, "")}/chat/completions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(buildRequestBody(actualModel, prompt, provider)),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };

        const text = data.choices?.[0]?.message?.content;
        if (!text) {
          throw new Error(`No content received from ${info.label} API`);
        }

        return { content: text };
      }

      if (
        RETRYABLE_STATUSES.includes(response.status) &&
        attempt < MAX_RETRIES - 1
      ) {
        await new Promise((r) =>
          setTimeout(r, Math.pow(2, attempt) * 1000)
        );
        continue;
      }

      const error = await response.text();
      throw new Error(`${info.label} API error: ${response.status} - ${error}`);
    } catch (err: any) {
      clearTimeout(timeout);

      if (err.name === "AbortError") {
        throw new Error(`${info.label} API request timed out after 30s`);
      }

      if (attempt === MAX_RETRIES - 1) {
        throw err;
      }

      await new Promise((r) =>
        setTimeout(r, Math.pow(2, attempt) * 1000)
      );
    }
  }

  throw new Error(`${info.label} API request failed after all retries`);
}
