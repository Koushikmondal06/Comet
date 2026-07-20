import chalk from "chalk";
import { getHistory, clearHistory, searchHistory } from "../../storage/history";
import { logger } from "../../utils/logger";
import { printTable } from "../ui/table";
import { EMOJIS } from "../../constants/emojis";

export interface HistoryCommandOptions {
  search?: string;
  clear?: boolean;
}

export async function historyCommand(
  options: HistoryCommandOptions
): Promise<void> {
  if (options.clear) {
    clearHistory();
    logger.success("History cleared.");
    return;
  }

  let history = options.search
    ? searchHistory(options.search)
    : getHistory();

  if (history.length === 0) {
    logger.info("No commit history found.");
    return;
  }

  logger.bold(
    `${EMOJIS.history} Commit History${options.search ? ` (filtered: "${options.search}")` : ""}`
  );
  logger.blank();

  const rows = history.map((entry) => [
    entry.date,
    entry.message,
    entry.branch,
  ]);

  printTable(["Date", "Message", "Branch"], rows);
}
