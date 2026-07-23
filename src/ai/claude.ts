import { spawnSync } from "child_process";
import { getApiKeyForProvider } from "../utils/env";
import { loadConfig } from "../config/config";
import { AIResponse } from "./provider";

const MAX_RETRIES = 3;
const TIMEOUT_MS = 60000;
// 529 = Anthropic "overloaded"
const RETRYABLE_STATUSES = [429, 500, 502, 503, 529];
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-opus-4-8";

const SYSTEM_PROMPT =
  "You are an expert git commit message generator. Always respond with valid JSON.";

export async function generateWithClaude(
  prompt: string,
  model?: string
): Promise<AIResponse> {
  const config = loadConfig();
  const actualModel =
    model ||
    process.env.ANTHROPIC_MODEL ||
    (config.provider === "claude" && config.model.startsWith("claude")
      ? config.model
      : DEFAULT_MODEL);

  if (config.claudeBackend === "claude-code") {
    return generateWithClaudeCode(prompt, actualModel);
  }

  return generateWithAnthropicApi(prompt, actualModel);
}

// Shells out to the locally installed Claude Code CLI — uses its own login,
// so no ANTHROPIC_API_KEY is required.
function generateWithClaudeCode(prompt: string, model: string): AIResponse {
  const result = spawnSync(
    "claude",
    ["-p", "--output-format", "text", "--model", model],
    {
      input: `${SYSTEM_PROMPT}\n\n${prompt}`,
      encoding: "utf-8",
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    }
  );

  if (result.error) {
    throw new Error(
      `Claude Code CLI failed: ${result.error.message}. Is 'claude' installed and logged in?`
    );
  }
  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    throw new Error(
      `Claude Code exited with status ${result.status}${stderr ? `: ${stderr}` : ""}`
    );
  }

  const text = (result.stdout || "").trim();
  if (!text) {
    throw new Error("No content received from Claude Code");
  }
  return { content: text };
}

async function generateWithAnthropicApi(
  prompt: string,
  model: string
): Promise<AIResponse> {
  const apiKey = getApiKeyForProvider("claude");
  return anthropicMessagesRequest(
    "https://api.anthropic.com/v1/messages",
    apiKey,
    prompt,
    model,
    "Anthropic"
  );
}

// Custom provider with an Anthropic-style endpoint (e.g. a Claude Code
// proxy). Model is optional — omitted, the endpoint's default is used.
export async function generateWithAnthropicCompatible(
  prompt: string,
  model?: string
): Promise<AIResponse> {
  const config = loadConfig();
  const baseUrl = process.env.CUSTOM_BASE_URL || config.customBaseUrl;
  if (!baseUrl) {
    throw new Error(
      "No base URL set for the custom provider. Run 'comet config' to set it (or export CUSTOM_BASE_URL)."
    );
  }
  const apiKey = getApiKeyForProvider("custom");
  const url = `${baseUrl.replace(/\/+$/, "")}/messages`;
  const actualModel = model || config.model || undefined;
  return anthropicMessagesRequest(url, apiKey, prompt, actualModel, "Custom");
}

async function anthropicMessagesRequest(
  url: string,
  apiKey: string,
  prompt: string,
  model: string | undefined,
  label: string
): Promise<AIResponse> {
  const body: Record<string, unknown> = {
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  };
  if (model) body.model = model;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = (await response.json()) as {
          content?: Array<{ type: string; text?: string }>;
          stop_reason?: string;
        };

        if (data.stop_reason === "refusal") {
          throw new Error("Claude declined this request (safety refusal)");
        }

        const text = data.content?.find((b) => b.type === "text")?.text;
        if (!text) {
          throw new Error(`No content received from ${label} API`);
        }

        return { content: text };
      }

      if (
        RETRYABLE_STATUSES.includes(response.status) &&
        attempt < MAX_RETRIES - 1
      ) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
        continue;
      }

      const error = await response.text();
      throw new Error(`${label} API error: ${response.status} - ${error}`);
    } catch (err: any) {
      clearTimeout(timeout);

      if (err.name === "AbortError") {
        throw new Error(`${label} API request timed out after 60s`);
      }

      if (attempt === MAX_RETRIES - 1) {
        throw err;
      }

      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }

  throw new Error(`${label} API request failed after all retries`);
}
