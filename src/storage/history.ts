import { CommitHistoryEntry } from "../types/commit";
import { readJsonFile, writeJsonFile, getConfigDir } from "../utils/files";
import * as path from "path";

const HISTORY_FILE = "history.json";
const MAX_HISTORY = 100;

function getHistoryPath(): string {
  return path.join(getConfigDir(), HISTORY_FILE);
}

export function getHistory(): CommitHistoryEntry[] {
  const history = readJsonFile<CommitHistoryEntry[]>(getHistoryPath());
  return history || [];
}

export function addToHistory(entry: CommitHistoryEntry): void {
  const history = getHistory();
  history.unshift(entry);

  if (history.length > MAX_HISTORY) {
    history.splice(MAX_HISTORY);
  }

  writeJsonFile(getHistoryPath(), history);
}

export function clearHistory(): void {
  writeJsonFile(getHistoryPath(), []);
}

export function searchHistory(query: string): CommitHistoryEntry[] {
  const history = getHistory();
  const lowerQuery = query.toLowerCase();
  return history.filter(
    (entry) =>
      entry.message.toLowerCase().includes(lowerQuery) ||
      entry.branch.toLowerCase().includes(lowerQuery)
  );
}

export function getHistoryByBranch(branch: string): CommitHistoryEntry[] {
  const history = getHistory();
  return history.filter((entry) => entry.branch === branch);
}

export function getRecentHistory(count: number = 10): CommitHistoryEntry[] {
  return getHistory().slice(0, count);
}
