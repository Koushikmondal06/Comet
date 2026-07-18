import fetch from "node-fetch";
import { getApiKeyForProvider } from "../utils/env";
import { AIResponse } from "./provider";

const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000;
const RETRYABLE_STATUSES = [429, 500, 502, 503, 504];

export async function generateWithGemini(
  prompt: string,
  model?: string
): Promise<AIResponse> {
  const apiKey = getApiKeyForProvider("gemini");
  const requestedModel = model || process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const fallbackModel = "gemini-2.0-flash";

  async function callGemini(modelName: string): Promise<AIResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              topK: 40,
              maxOutputTokens: 8192,
            },
          }),
          signal: controller.signal as any,
        });

        clearTimeout(timeout);

        if (response.ok) {
          const data = (await response.json()) as {
            candidates?: Array<{
              content?: { parts?: Array<{ text?: string }> };
            }>;
          };

          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            throw new Error("No content received from Gemini API");
          }

          return { content: text };
        }

        const errorBody = await response.text();

        if (response.status === 429) {
          const isQuotaExhausted = errorBody.includes("limit: 0") || errorBody.includes("RESOURCE_EXHAUSTED");
          if (isQuotaExhausted && attempt === 0) {
            throw new Error(`QUOTA_EXCEEDED:${modelName}`);
          }
          if (attempt < MAX_RETRIES - 1) {
            await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
            continue;
          }
        }

        if (RETRYABLE_STATUSES.includes(response.status) && attempt < MAX_RETRIES - 1) {
          await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
          continue;
        }

        throw new Error(`Gemini API error: ${response.status} - ${errorBody}`);
      } catch (err: any) {
        clearTimeout(timeout);

        if (err.name === "AbortError") {
          throw new Error("Gemini API request timed out after 30s");
        }

        if (err.message?.startsWith("QUOTA_EXCEEDED:")) {
          throw err;
        }

        if (attempt === MAX_RETRIES - 1) {
          throw err;
        }

        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }

    throw new Error("Gemini API request failed after all retries");
  }

  try {
    return await callGemini(requestedModel);
  } catch (err: any) {
    if (err.message?.startsWith("QUOTA_EXCEEDED:") && requestedModel !== fallbackModel) {
      console.log(`\n  ⚠ ${requestedModel} quota exceeded. Falling back to ${fallbackModel}...\n`);
      return await callGemini(fallbackModel);
    }
    throw err;
  }
}
