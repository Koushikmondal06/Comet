import chalk from "chalk";
import { execFileSync } from "child_process";
import inquirer from "inquirer";
import { getStagedDiff, getStagedFiles } from "../../git/diff";
import { getCurrentBranch, getRecentCommits, getRepoName } from "../../git/branch";
import { hasStagedChanges, stageAllFiles } from "../../git/status";
import { createCommit, pushCommits } from "../../git/commit";
import { generateCommitSuggestions } from "../../ai/provider";
import { parseCommitSuggestions } from "../../ai/parser";
import { selectCommit } from "../prompts/selectCommit";
import { confirmAction } from "../prompts/confirm";
import { withSpinner } from "../ui/spinner";
import { logger } from "../../utils/logger";
import { addToHistory } from "../../storage/history";
import { formatDate } from "../../utils/helpers";
import { loadConfig } from "../../config/config";
import { ensureApiKey } from "../../utils/env";
import { CommitSuggestion, AIContext } from "../../types/commit";
import { EMOJIS } from "../../constants/emojis";

export interface CommitCommandOptions {
  push?: boolean;
  dryRun?: boolean;
  provider?: string;
  model?: string;
  chooseModel?: boolean;
  count?: string;
  message?: string;
  yes?: boolean;
  quiet?: boolean;
}

export async function commitCommand(options: CommitCommandOptions): Promise<void> {
  try {
    const config = loadConfig();
    const count = parseInt(options.count || "3", 10);

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

    await ensureApiKey();

    let chosenModel = options.model;

    if (options.chooseModel && !chosenModel) {
      const geminiModels = [
        { name: "Gemini 2.5 Flash (fast, recommended)", value: "gemini-2.5-flash" },
        { name: "Gemini 2.5 Pro (most capable)", value: "gemini-2.5-pro" },
        { name: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
        { name: "Gemini 2.0 Flash-Lite", value: "gemini-2.0-flash-lite" },
      ];
      const openaiModels = [
        { name: "GPT-4o (recommended)", value: "gpt-4o" },
        { name: "GPT-4o Mini (fast, cheap)", value: "gpt-4o-mini" },
        { name: "GPT-4 Turbo", value: "gpt-4-turbo" },
        { name: "GPT-3.5 Turbo (cheapest)", value: "gpt-3.5-turbo" },
        { name: "o1 (reasoning model)", value: "o1" },
        { name: "o1 Mini (fast reasoning)", value: "o1-mini" },
      ];
      const models = config.provider === "gemini" ? geminiModels : openaiModels;
      const result = await inquirer.prompt([
        {
          type: "list",
          name: "model",
          message: `Select ${config.provider} model:`,
          choices: models,
        },
      ]);
      chosenModel = result.model;
    }

    const rawResponse = await withSpinner("Contacting AI", async () => {
      return generateCommitSuggestions(context, count, options.provider as any, chosenModel);
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

    // Apply emoji prefix if enabled in config
    if (config.emoji) {
      const emoji = EMOJIS[selected.type as keyof typeof EMOJIS];
      if (emoji && !selected.message.startsWith(emoji)) {
        selected.message = `${emoji} ${selected.message}`;
      }
    }

    // Enforce max length from config
    if (config.maxLength && selected.message.length > config.maxLength) {
      selected.message = selected.message.substring(0, config.maxLength);
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
    logger.error(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    process.exit(1);
  }
}
