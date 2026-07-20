import { execFileSync } from "child_process";
import { CommitHistoryEntry } from "../types/commit";
import { getCurrentBranch } from "./branch";

export function getCommitHistory(count: number = 20): CommitHistoryEntry[] {
  try {
    const output = execFileSync(
      "git",
      ["log", "--oneline", `-${count}`, "--format=%H|%s|%ai"],
      { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }
    ).trim();

    if (!output) return [];

    return output.split("\n").map((line) => {
      const [hash, message, date] = line.split("|");
      return {
        hash: hash.trim(),
        message: message.trim(),
        date: date ? date.trim().split(" ")[0] : "",
        branch: getCurrentBranch(),
      };
    });
  } catch {
    return [];
  }
}

export function getFilteredHistory(
  search: string,
  count: number = 20
): CommitHistoryEntry[] {
  const history = getCommitHistory(count);
  const lowerSearch = search.toLowerCase();
  return history.filter(
    (entry) =>
      entry.message.toLowerCase().includes(lowerSearch) ||
      entry.branch.toLowerCase().includes(lowerSearch)
  );
}
