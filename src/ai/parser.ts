import { CommitSuggestion } from "../types/commit";

function tryParseJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function extractJsonArray(raw: string): unknown[] | null {
  const firstBracket = raw.indexOf("[");
  const lastBracket = raw.lastIndexOf("]");

  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const slice = raw.substring(firstBracket, lastBracket + 1);
    const parsed = tryParseJson(slice);
    if (Array.isArray(parsed)) return parsed;
  }

  return null;
}

function extractJsonObject(raw: string): Record<string, any> | null {
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const slice = raw.substring(firstBrace, lastBrace + 1);
    const parsed = tryParseJson(slice);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  }

  return null;
}

export function parseCommitSuggestions(
  rawResponse: string
): CommitSuggestion[] {
  try {
    const parsed = extractJsonArray(rawResponse);
    if (!parsed) {
      throw new Error(`No JSON array found. Response: ${rawResponse.substring(0, 300)}`);
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

export function parseReviewResponse(rawResponse: string): unknown {
  return parseJsonObjectResponse(rawResponse);
}

export function parseExplainResponse(rawResponse: string): unknown {
  return parseJsonObjectResponse(rawResponse);
}
