import { Command } from "commander";
import { commitCommand } from "./commands/commit";
import { reviewCommand } from "./commands/review";
import { explainCommand } from "./commands/explain";
import { configCommand } from "./commands/config";
import { historyCommand, HistoryCommandOptions } from "./commands/history";
import { refactorCommand } from "./commands/refactor";
import { showBanner } from "./ui/banner";

const program = new Command();

program
  .name("comet")
  .version("1.0.0")
  .description("AI-powered commit message generator")
  .option("--no-banner", "Suppress the ASCII banner");

program
  .command("commit", { isDefault: true })
  .description("Generate and create an AI-powered commit")
  .option("-p, --push", "Push after commit")
  .option("-d, --dry-run", "Show suggestions without committing")
  .option("-m, --message <message>", "Skip selection, use this message")
  .option("--provider <provider>", "AI provider (gemini/openai)")
  .option("--model <model>", "AI model to use")
  .option("-n, --count <count>", "Number of suggestions", "3")
  .option("--choose-model", "Choose AI model before generating")
  .option("-y, --yes", "Auto-confirm (skip confirmation prompts)")
  .option("-q, --quiet", "Suppress non-essential output")
  .action(async (options) => {
    if (program.opts().banner !== false) showBanner();
    await commitCommand(options);
  });

program
  .command("review")
  .description("AI-powered code review of staged changes")
  .action(async () => {
    if (program.opts().banner !== false) showBanner();
    await reviewCommand();
  });

program
  .command("explain")
  .description("Explain staged changes in plain English")
  .action(async () => {
    if (program.opts().banner !== false) showBanner();
    await explainCommand();
  });

program
  .command("config")
  .description("Configure AI Commit Generator settings")
  .action(async () => {
    if (program.opts().banner !== false) showBanner();
    await configCommand();
  });

program
  .command("history")
  .description("View AI-generated commit history")
  .option("-s, --search <query>", "Search history")
  .option("--clear", "Clear commit history")
  .action(async (options: HistoryCommandOptions) => {
    if (program.opts().banner !== false) showBanner();
    await historyCommand(options);
  });

program
  .command("refactor")
  .description("AI-powered refactoring suggestions for staged changes")
  .action(async () => {
    if (program.opts().banner !== false) showBanner();
    await refactorCommand();
  });

export { program };
