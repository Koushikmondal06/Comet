import { CommitSuggestion } from "../types/commit";

function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json|JSON)?\s*\n?/gm, "")
    .replace(/```\s*$/gm, "")
    .trim();
}

function tryParseJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function extractJsonArray(raw: string): unknown[] | null {
  const cleaned = stripCodeFences(raw);

  // Try parsing the whole cleaned response as JSON first
  const directParse = tryParseJson(cleaned);
  if (Array.isArray(directParse)) return directParse;

  // Find the first [ and last ] to extract the array
  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");

  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const slice = cleaned.substring(firstBracket, lastBracket + 1);
    const parsed = tryParseJson(slice);
    if (Array.isArray(parsed)) return parsed;
  }

  // Try greedy regex as fallback
  const greedyMatch = cleaned.match(/\[[\s\S]*\]/);
  if (greedyMatch) {
    const parsed = tryParseJson(greedyMatch[0]);
    if (Array.isArray(parsed)) return parsed;
  }

  return null;
}

function extractJsonObject(raw: string): Record<string, any> | null {
  const cleaned = stripCodeFences(raw);

  const directParse = tryParseJson(cleaned);
  if (directParse && typeof directParse === "object" && !Array.isArray(directParse)) {
    return directParse;
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const slice = cleaned.substring(firstBrace, lastBrace + 1);
    const parsed = tryParseJson(slice);
    if (parsed && typeof parsed === "object") return parsed;
  }

  return null;
}

export function parseCommitSuggestions(
  rawResponse: string
): CommitSuggestion[] {
  try {
    const parsed = extractJsonArray(rawResponse);
    if (!parsed) {
      throw new Error(`No JSON array found in response. Raw: ${rawResponse.substring(0, 200)}`);
    }

    if (!Array.isArray(parsed)) {
      throw new Error("Parsed response is not an array");
    }

    return parsed
      .filter((item): item is CommitSuggestion => {
        return (
          typeof item === "object" &&
          item !== null &&
          "message" in item &&
          "type" in item
        );
      })
      .map((item) => ({
        message: String(item.message),
        type: String(item.type) as CommitSuggestion["type"],
        scope: item.scope ? String(item.scope) : undefined,
        description: item.description ? String(item.description) : "",
      }));
  } catch (error) {
    throw new Error(
      `Failed to parse AI response: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export function parseJsonObjectResponse(
  rawResponse: string
): Record<string, any> | null {
  try {
    const parsed = extractJsonObject(rawResponse);
    if (!parsed) {
      throw new Error("No JSON object found in response");
    }
    return parsed;
  } catch (error) {
    throw new Error(
      `Failed to parse JSON object response: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Backwards-compatible aliases
export function parseReviewResponse(rawResponse: string): unknown {
  return parseJsonObjectResponse(rawResponse);
}

export function parseExplainResponse(rawResponse: string): unknown {
  return parseJsonObjectResponse(rawResponse);
}
