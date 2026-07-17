import { CommitSuggestion, CommitType } from "../types/commit";

const VALID_TYPES: CommitType[] = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "build",
  "ci",
  "chore",
  "revert",
];

const CONVENTIONAL_COMMIT_REGEX =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,72}$/;

export function isValidCommitType(type: string): type is CommitType {
  return VALID_TYPES.includes(type as CommitType);
}

export function isValidCommitMessage(message: string): boolean {
  return CONVENTIONAL_COMMIT_REGEX.test(message);
}

export function validateCommitSuggestion(
  suggestion: CommitSuggestion
): boolean {
  if (!suggestion.message || typeof suggestion.message !== "string") {
    return false;
  }
  if (!isValidCommitType(suggestion.type)) {
    return false;
  }
  if (suggestion.message.length > 100) {
    return false;
  }
  return true;
}

export function sanitizeCommitMessage(message: string): string {
  return message
    .replace(/[\x00-\x1F\x7F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateMessage(message: string, maxLength: number): string {
  if (message.length <= maxLength) return message;
  return message.slice(0, maxLength - 3) + "...";
}
