import { describe, it, expect } from "vitest";
import { isValidCommitType, isValidCommitMessage, sanitizeCommitMessage, truncateMessage } from "../src/utils/validator";

describe("isValidCommitType", () => {
  it("should accept valid commit types", () => {
    expect(isValidCommitType("feat")).toBe(true);
    expect(isValidCommitType("fix")).toBe(true);
    expect(isValidCommitType("docs")).toBe(true);
    expect(isValidCommitType("style")).toBe(true);
    expect(isValidCommitType("refactor")).toBe(true);
    expect(isValidCommitType("perf")).toBe(true);
    expect(isValidCommitType("test")).toBe(true);
    expect(isValidCommitType("build")).toBe(true);
    expect(isValidCommitType("ci")).toBe(true);
    expect(isValidCommitType("chore")).toBe(true);
    expect(isValidCommitType("revert")).toBe(true);
  });

  it("should reject invalid commit types", () => {
    expect(isValidCommitType("invalid")).toBe(false);
    expect(isValidCommitType("FEAT")).toBe(false);
    expect(isValidCommitType("feature")).toBe(false);
    expect(isValidCommitType("")).toBe(false);
  });
});

describe("isValidCommitMessage", () => {
  it("should accept valid conventional commits", () => {
    expect(isValidCommitMessage("feat: add login")).toBe(true);
    expect(isValidCommitMessage("fix(auth): handle null")).toBe(true);
    expect(isValidCommitMessage("docs: update README")).toBe(true);
    expect(isValidCommitMessage("chore: bump version")).toBe(true);
  });

  it("should reject invalid messages", () => {
    expect(isValidCommitMessage("added feature")).toBe(false);
    expect(isValidCommitMessage("Fix bug")).toBe(false);
    expect(isValidCommitMessage("feat: ")).toBe(false);
    expect(isValidCommitMessage("")).toBe(false);
  });
});

describe("sanitizeCommitMessage", () => {
  it("should remove control characters", () => {
    expect(sanitizeCommitMessage("feat\x00: add")).toBe("feat: add");
  });

  it("should normalize whitespace", () => {
    expect(sanitizeCommitMessage("feat:   add   feature")).toBe("feat: add feature");
  });

  it("should trim whitespace", () => {
    expect(sanitizeCommitMessage("  feat: add  ")).toBe("feat: add");
  });
});

describe("truncateMessage", () => {
  it("should not truncate short messages", () => {
    expect(truncateMessage("short", 100)).toBe("short");
  });

  it("should truncate long messages", () => {
    const long = "a".repeat(80);
    const result = truncateMessage(long, 60);
    expect(result.length).toBe(60);
    expect(result.endsWith("...")).toBe(true);
  });
});
