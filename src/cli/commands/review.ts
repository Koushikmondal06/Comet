import chalk from "chalk";
import { getStagedDiff, getStagedFiles } from "../../git/diff";
import { hasStagedChanges, stageAllFiles } from "../../git/status";
import { generateAIResponse, resolveProviderOption } from "../../ai/provider";
import { buildReviewPrompt } from "../../ai/prompts";
import { parseReviewResponse } from "../../ai/parser";
import { withSpinner } from "../ui/spinner";
import { logger } from "../../utils/logger";
import { isPromptCancel } from "../../utils/helpers";
import { confirmAction } from "../prompts/confirm";
import { printTable } from "../ui/table";
import { ensureApiKey } from "../../utils/env";
import { AIContext } from "../../types/commit";
import { getCurrentBranch, getRepoName } from "../../git/branch";

export interface AIOptions {
  provider?: string;
  model?: string;
}

export async function reviewCommand(options: AIOptions = {}): Promise<void> {
  try {
    const provider = resolveProviderOption(options.provider);
    if (!hasStagedChanges()) {
      const shouldStage = await confirmAction(
        "No staged changes found. Stage all changes?"
      );
      if (!shouldStage) {
        logger.warn("No changes to review.");
        return;
      }
      await withSpinner("Staging all changes", async () => {
        stageAllFiles();
      });
    }

    const context: AIContext = await withSpinner("Reading staged changes", async () => {
      const diff = getStagedDiff();
      const files = getStagedFiles();
      const branch = getCurrentBranch();
      const repo = getRepoName();

      return {
        repository: repo,
        branch,
        recentCommits: [],
        changedFiles: files,
        diff,
      };
    });

    const prompt = buildReviewPrompt(context);

    await ensureApiKey(provider);

    const response = await withSpinner("AI is reviewing code", async () => {
      return generateAIResponse(prompt, provider, options.model);
    });

    const review = parseReviewResponse(response.content) as {
      summary?: string;
      issues?: Array<{
        severity?: string;
        file?: string;
        message?: string;
        suggestion?: string;
      }>;
      score?: number;
    };

    logger.blank();
    logger.bold("Code Review");
    logger.blank();

    if (review.summary) {
      logger.info(`Summary: ${review.summary}`);
      logger.blank();
    }

    if (review.score !== undefined) {
      const scoreColor =
        review.score >= 80 ? chalk.green : review.score >= 60 ? chalk.yellow : chalk.red;
      logger.info(`Score: ${scoreColor(review.score)}/100`);
      logger.blank();
    }

    if (review.issues && review.issues.length > 0) {
      logger.bold(`Found ${review.issues.length} issue(s):`);
      logger.blank();

      const rows = review.issues.map((issue) => [
        issue.severity || "info",
        issue.file || "-",
        issue.message || "-",
        issue.suggestion || "-",
      ]);

      printTable(["Severity", "File", "Issue", "Suggestion"], rows);
    } else {
      logger.success("No issues found!");
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
