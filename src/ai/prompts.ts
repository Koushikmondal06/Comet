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

export function buildCommitPrompt(
  context: AIContext,
  count: number,
  maxLength: number = 72,
  language: string = "en",
  mood?: string
): string {
  return PROMPTS.commit
    .replace("{repository}", context.repository)
    .replace("{branch}", context.branch)
    .replace(
      "{recentCommits}",
      context.recentCommits.map((c) => `  - ${c}`).join("\n") || "  (none)"
    )
    .replace(
      "{changedFiles}",
      context.changedFiles
        .map((f) => `  - [${f.status}] ${f.path}`)
        .join("\n")
    )
    .replace("{diff}", truncateDiff(context.diff))
    .replace("{count}", count.toString())
    .replace("{max_length}", String(maxLength))
    .replace("{language}", language)
    .replace("{mood}", mood || "standard");
}

export function buildReviewPrompt(context: AIContext): string {
  return PROMPTS.review
    .replace(
      "{changedFiles}",
      context.changedFiles
        .map((f) => `  - [${f.status}] ${f.path}`)
        .join("\n")
    )
    .replace("{diff}", truncateDiff(context.diff));
}

export function buildExplainPrompt(context: AIContext): string {
  return PROMPTS.explain
    .replace(
      "{changedFiles}",
      context.changedFiles
        .map((f) => `  - [${f.status}] ${f.path}`)
        .join("\n")
    )
    .replace("{diff}", truncateDiff(context.diff));
}

export function buildRefactorPrompt(diff: string): string {
  return PROMPTS.refactor.replace("{diff}", truncateDiff(diff));
}
