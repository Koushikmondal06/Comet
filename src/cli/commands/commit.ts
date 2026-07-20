import chalk from "chalk";
import { execFileSync } from "child_process";
import { select, input } from "@inquirer/prompts";
import { getStagedDiff, getStagedFiles } from "../../git/diff";
import { getCurrentBranch, getRecentCommits, getRepoName } from "../../git/branch";
import { hasStagedChanges, stageAllFiles } from "../../git/status";
import { createCommit, pushCommits } from "../../git/commit";
import { generateCommitSuggestions, resolveProviderOption } from "../../ai/provider";
import { parseCommitSuggestions } from "../../ai/parser";
import { truncateMessage } from "../../utils/validator";
import { selectCommit } from "../prompts/selectCommit";
import { confirmAction } from "../prompts/confirm";
import { withSpinner } from "../ui/spinner";
import { logger } from "../../utils/logger";
import { addToHistory } from "../../storage/history";
import { formatDate, isPromptCancel } from "../../utils/helpers";
import { loadConfig } from "../../config/config";
import { ensureApiKey } from "../../utils/env";
import { CommitSuggestion, AIContext } from "../../types/commit";
import { EMOJIS } from "../../constants/emojis";
import { getModelsForProvider } from "../../constants/models";

export interface CommitCommandOptions {
  push?: boolean;
  dryRun?: boolean;
  provider?: string;
  model?: string;
  chooseModel?: boolean;
  style?: string;
  count?: string;
  message?: string;
  yes?: boolean;
  quiet?: boolean;
}

export async function commitCommand(options: CommitCommandOptions): Promise<void> {
  try {
    const config = loadConfig();
    const provider = resolveProviderOption(options.provider);

    const parsedCount = parseInt(options.count || "3", 10);
    if (options.count && (Number.isNaN(parsedCount) || parsedCount < 1)) {
      logger.warn(`Invalid count '${options.count}', using 3.`);
    }
    const count =
      Number.isNaN(parsedCount) || parsedCount < 1 ? 3 : Math.min(parsedCount, 10);

    if (!hasStagedChanges()) {
      const shouldStage = await confirmAction(
        "No staged changes found. Stage all changes?"
      );
      if (!shouldStage) {
        logger.warn("No changes to commit.");
        return;
      }
      await withSpinner("Staging all changes", async () => {
        stageAllFiles();
      });
    }

    const context: AIContext = await withSpinner("Reading git context", async () => {
      const diff = getStagedDiff();
      const files = getStagedFiles();
      const branch = getCurrentBranch();
      const repo = getRepoName();
      const recent = getRecentCommits(5);

      return {
        repository: repo,
        branch,
        recentCommits: recent,
        changedFiles: files,
        diff,
      };
    });

    await ensureApiKey(provider);

    let chosenModel = options.model;
    const effectiveProvider = provider || config.provider;

    if (options.chooseModel && !chosenModel) {
      chosenModel = await select({
        message: `Select ${effectiveProvider} model:`,
        choices: getModelsForProvider(effectiveProvider),
      });
    }

    let commitMood = options.style || "";
    if (options.chooseModel && !commitMood) {
      commitMood = await input({
        message: "Commit style (e.g. concise, detailed, casual, formal):",
        default: "standard",
      });
    }

    const rawResponse = await withSpinner("Contacting AI", async () => {
      return generateCommitSuggestions(context, {
        count,
        provider,
        model: chosenModel,
        mood: commitMood,
        maxLength: config.maxLength,
        language: config.language,
      });
    });

    const suggestions = parseCommitSuggestions(rawResponse);

    if (suggestions.length === 0) {
      logger.error("No commit suggestions generated.");
      return;
    }

    let selected: CommitSuggestion;

    if (options.message) {
      selected = {
        message: options.message,
        type: "chore",
        description: "User-provided message",
      };
    } else {
      if (!options.quiet) {
        logger.blank();
        logger.bold("Suggested Commits:");
        logger.blank();
      }
      selected = await selectCommit(suggestions);
    }

    // Enforce max length before adding the emoji so the prefix isn't counted
    if (config.maxLength && selected.message.length > config.maxLength) {
      selected.message = truncateMessage(selected.message, config.maxLength);
    }

    if (config.emoji) {
      const emoji = EMOJIS[selected.type as keyof typeof EMOJIS];
      if (emoji && !selected.message.startsWith(emoji)) {
        selected.message = `${emoji} ${selected.message}`;
      }
    }

    if (options.dryRun) {
      if (!options.quiet) {
        logger.blank();
        logger.info("Dry run - commit message:");
      }
      logger.bold(selected.message);
      return;
    }

    // Skip confirmation if --yes flag or autoCommit config is set
    const skipConfirm = options.yes || config.autoCommit;
    if (!skipConfirm) {
      const shouldCommit = await confirmAction(
        `Commit with message: "${selected.message}"?`
      );

      if (!shouldCommit) {
        logger.warn("Commit cancelled.");
        return;
      }
    }

    const committed = await withSpinner("Creating commit", async () => {
      return createCommit(selected.message);
    });

    if (!committed) {
      logger.error("Failed to create commit.");
      return;
    }

    // Resolve actual commit SHA
    const sha = execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf-8",
    }).trim();

    addToHistory({
      date: formatDate(new Date()),
      message: selected.message,
      branch: context.branch,
      hash: sha,
    });

    if (!options.quiet) {
      logger.blank();
      logger.success(`Committed: ${chalk.white(selected.message)}`);
    }

    if (options.push) {
      const pushed = await withSpinner("Pushing to remote", async () => {
        return pushCommits();
      });

      if (pushed) {
        logger.success("Pushed successfully!");
      } else {
        logger.error("Failed to push. Try pushing manually.");
      }
    }
  } catch (error) {
    if (isPromptCancel(error)) {
      logger.warn("Cancelled.");
      return;
    }
    logger.error(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    process.exit(1);
  }
}
