import { describe, it, expect } from "vitest";
import { parseCommitSuggestions, parseReviewResponse, parseExplainResponse } from "../src/ai/parser";

describe("parseCommitSuggestions", () => {
  it("should parse valid JSON array of suggestions", () => {
    const response = `[
      {
        "message": "feat(auth): add JWT middleware",
        "type": "feat",
        "scope": "auth",
        "description": "Add JWT authentication middleware"
      },
      {
        "message": "fix(api): handle timeout",
        "type": "fix",
        "scope": "api",
        "description": "Fix API timeout handling"
      }
    ]`;

    const result = parseCommitSuggestions(response);
    expect(result).toHaveLength(2);
    expect(result[0].message).toBe("feat(auth): add JWT middleware");
    expect(result[0].type).toBe("feat");
    expect(result[1].message).toBe("fix(api): handle timeout");
    expect(result[1].type).toBe("fix");
  });

  it("should handle response with text around JSON", () => {
    const response = `Here are some suggestions:
    [
      {
        "message": "feat: add feature",
        "type": "feat",
        "description": "New feature"
      }
    ]
    Hope this helps!`;

    const result = parseCommitSuggestions(response);
    expect(result).toHaveLength(1);
    expect(result[0].message).toBe("feat: add feature");
  });

  it("should throw error for invalid JSON", () => {
    expect(() => parseCommitSuggestions("not json")).toThrow(
      "Failed to parse AI response"
    );
  });

  it("should throw error for non-array JSON", () => {
    expect(() =>
      parseCommitSuggestions('{"message": "test"}')
    ).toThrow("No JSON array found");
  });

  it("should filter out invalid items", () => {
    const response = `[
      { "message": "valid", "type": "feat" },
      { "invalid": "item" },
      { "message": "also valid", "type": "fix", "scope": "api" }
    ]`;

    const result = parseCommitSuggestions(response);
    expect(result).toHaveLength(2);
  });
});

describe("parseReviewResponse", () => {
  it("should parse valid review JSON", () => {
    const response = `{
      "summary": "Code looks good",
      "issues": [
        {
          "severity": "warning",
          "file": "src/index.ts",
          "message": "Missing error handling",
          "suggestion": "Add try-catch"
        }
      ],
      "score": 85
    }`;

    const result = parseReviewResponse(response) as any;
    expect(result.summary).toBe("Code looks good");
    expect(result.issues).toHaveLength(1);
    expect(result.score).toBe(85);
  });
});

describe("parseExplainResponse", () => {
  it("should parse valid explanation JSON", () => {
    const response = `{
      "summary": "Added login feature",
      "explanation": "This adds user authentication",
      "impact": "Users can now log in",
      "category": "new-feature"
    }`;

    const result = parseExplainResponse(response) as any;
    expect(result.summary).toBe("Added login feature");
    expect(result.category).toBe("new-feature");
  });
});
