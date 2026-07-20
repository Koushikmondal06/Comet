import { CommitSuggestion } from "../types/commit";
import { isValidCommitType, sanitizeCommitMessage } from "../utils/validator";

function tryParseJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function tryFixTruncatedJson(text: string): any {
  let fixed = text.trim();

  // Remove trailing commas before closing brackets
  fixed = fixed.replace(/,\s*$/, "");

  // Try closing open structures
  const openBrackets = (fixed.match(/\[/g) || []).length;
  const closeBrackets = (fixed.match(/\]/g) || []).length;
  const openBraces = (fixed.match(/\{/g) || []).length;
  const closeBraces = (fixed.match(/\}/g) || []).length;

  // Close any open string (ignore escaped quotes when counting)
  const quoteCount = (fixed.replace(/\\[\s\S]/g, "").match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    fixed += '"';
  }

  // Close open objects first, then arrays
  for (let i = 0; i < openBraces - closeBraces; i++) {
    fixed += "}";
  }
  for (let i = 0; i < openBrackets - closeBrackets; i++) {
    fixed += "]";
  }

  return tryParseJson(fixed);
}

function extractJsonArray(raw: string): unknown[] | null {
  const firstBracket = raw.indexOf("[");
  const lastBracket = raw.lastIndexOf("]");

  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const slice = raw.substring(firstBracket, lastBracket + 1);
    const parsed = tryParseJson(slice);
    if (Array.isArray(parsed)) return parsed;
  }

  // Response might be truncated - try to fix it
  if (firstBracket !== -1) {
    const slice = raw.substring(firstBracket);
    const parsed = tryFixTruncatedJson(slice);
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
        message: sanitizeCommitMessage(String(item.message)),
        type: String(item.type) as CommitSuggestion["type"],
        scope: item.scope ? String(item.scope) : undefined,
        description: item.description ? String(item.description) : "",
      }))
      .filter((item) => item.message.length > 0 && isValidCommitType(item.type));
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
