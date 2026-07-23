import { AIContext } from "../types/commit";
import { PROMPTS } from "../constants/prompts";

const MAX_DIFF_LENGTH = 10000;

function truncateDiff(diff: string): string {
  if (diff.length <= MAX_DIFF_LENGTH) return diff;
  return (
    diff.substring(0, MAX_DIFF_LENGTH) +
    "\n\n[... diff truncated due to size ...]"
  );
}

// Function replacers so `$`-patterns in diffs/messages are inserted literally
function fillTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, () => value),
    template
  );
}

function formatChangedFiles(context: AIContext): string {
  return context.changedFiles
    .map((f) => `  - [${f.status}] ${f.path}`)
    .join("\n");
}

export function buildCommitPrompt(
  context: AIContext,
  count: number,
  maxLength: number = 72,
  language: string = "en",
  mood?: string
): string {
  return fillTemplate(PROMPTS.commit, {
    repository: context.repository,
    branch: context.branch,
    recentCommits:
      context.recentCommits.map((c) => `  - ${c}`).join("\n") || "  (none)",
    changedFiles: formatChangedFiles(context),
    diff: truncateDiff(context.diff),
    count: count.toString(),
    max_length: String(maxLength),
    language,
    mood: mood || "standard",
  });
}

export function buildReviewPrompt(context: AIContext): string {
  return fillTemplate(PROMPTS.review, {
    changedFiles: formatChangedFiles(context),
    diff: truncateDiff(context.diff),
  });
}

export function buildExplainPrompt(context: AIContext): string {
  return fillTemplate(PROMPTS.explain, {
    changedFiles: formatChangedFiles(context),
    diff: truncateDiff(context.diff),
  });
}

export function buildRefactorPrompt(diff: string): string {
  return fillTemplate(PROMPTS.refactor, {
    diff: truncateDiff(diff),
  });
}
