import fetch from "node-fetch";
import { getApiKeyForProvider } from "../utils/env";
import { AIResponse } from "./provider";

const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000;
const RETRYABLE_STATUSES = [429, 500, 502, 503, 504];

export async function generateWithOpenAI(
  prompt: string,
  model?: string
): Promise<AIResponse> {
  const apiKey = getApiKeyForProvider("openai");
  const actualModel = model || process.env.OPENAI_MODEL || "gpt-4o";

  const url = "https://api.openai.com/v1/chat/completions";

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: actualModel,
          messages: [
            {
              role: "system",
              content:
                "You are an expert git commit message generator. Always respond with valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 8192,
        }),
        signal: controller.signal as any,
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };

        const text = data.choices?.[0]?.message?.content;
        if (!text) {
          throw new Error("No content received from OpenAI API");
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
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    } catch (err: any) {
      clearTimeout(timeout);

      if (err.name === "AbortError") {
        throw new Error("OpenAI API request timed out after 30s");
      }

      if (attempt === MAX_RETRIES - 1) {
        throw err;
      }

      await new Promise((r) =>
        setTimeout(r, Math.pow(2, attempt) * 1000)
      );
    }
  }

  throw new Error("OpenAI API request failed after all retries");
}
