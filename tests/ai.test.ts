import { describe, it, expect } from "vitest";
import { buildCommitPrompt, buildReviewPrompt, buildExplainPrompt, buildRefactorPrompt } from "../src/ai/prompts";
import { AIContext } from "../src/types/commit";

const mockContext: AIContext = {
  repository: "test/repo",
  branch: "feature/auth",
  recentCommits: ["feat(wallet): add MetaMask", "fix(api): handle timeout"],
  changedFiles: [
    { path: "src/auth/login.ts", status: "modified" },
    { path: "src/auth/token.ts", status: "added" },
  ],
  diff: `diff --git a/src/auth/login.ts b/src/auth/login.ts
index 1234567..abcdefg 100644
--- a/src/auth/login.ts
+++ b/src/auth/login.ts
@@ -1,3 +1,4 @@
+import { verifyToken } from './token';
 export function login() {
+  verifyToken();
 }`,
};

describe("buildCommitPrompt", () => {
  it("should replace all placeholders", () => {
    const prompt = buildCommitPrompt(mockContext, 3);

    expect(prompt).toContain("test/repo");
    expect(prompt).toContain("feature/auth");
    expect(prompt).toContain("feat(wallet): add MetaMask");
    expect(prompt).toContain("src/auth/login.ts");
    expect(prompt).toContain("src/auth/token.ts");
    expect(prompt).toContain("3");
    expect(prompt).toContain("verifyToken");
  });
});

describe("buildReviewPrompt", () => {
  it("should build review prompt with context", () => {
    const prompt = buildReviewPrompt(mockContext);

    expect(prompt).toContain("src/auth/login.ts");
    expect(prompt).toContain("src/auth/token.ts");
    expect(prompt).toContain("verifyToken");
    expect(prompt).toContain("code review");
  });
});

describe("buildExplainPrompt", () => {
  it("should build explain prompt with context", () => {
    const prompt = buildExplainPrompt(mockContext);

    expect(prompt).toContain("src/auth/login.ts");
    expect(prompt).toContain("verifyToken");
    expect(prompt).toContain("plain English");
  });
});

describe("buildRefactorPrompt", () => {
  it("should build refactor prompt with diff", () => {
    const prompt = buildRefactorPrompt(mockContext.diff);

    expect(prompt).toContain("verifyToken");
    expect(prompt).toContain("refactor");
  });
});
