import { Command } from "commander";
import chalk from "chalk";
import { commitCommand } from "./commands/commit";
import { reviewCommand } from "./commands/review";
import { explainCommand } from "./commands/explain";
import { configCommand } from "./commands/config";
import { historyCommand, HistoryCommandOptions } from "./commands/history";
import { refactorCommand } from "./commands/refactor";
import { showBanner } from "./ui/banner";
import { EMOJIS } from "../constants/emojis";

function showHelp(): void {
  showBanner();

  console.log(chalk.cyan.bold("Usage:"));
  console.log("  comet [command] [options]\n");

  console.log(chalk.cyan.bold("Commands:"));
  const commands = [
    ["commit", "Generate and create an AI-powered commit", "(default)"],
    ["review", "AI-powered code review of staged changes", ""],
    ["explain", "Explain staged changes in plain English", ""],
    ["refactor", "AI-powered refactoring suggestions", ""],
    ["config", "Configure settings (provider, model, API key)", ""],
    ["history", "View and search commit history", ""],
    ["help", "Show this help message", ""],
  ];

  commands.forEach(([cmd, desc, note]) => {
    const pad = cmd.padEnd(12);
    const noteStr = note ? chalk.gray(` ${note}`) : "";
    console.log(`  ${chalk.green(pad)} ${desc}${noteStr}`);
  });

  console.log(chalk.cyan.bold("\nCommit Options:"));
  const opts = [
    ["-p, --push", "Push after commit"],
    ["-d, --dry-run", "Show suggestions without committing"],
    ["-m, --message <msg>", "Skip selection, use this message"],
    ["-n, --count <n>", "Number of suggestions (default: 3)"],
    ["-y, --yes", "Auto-confirm (skip prompts)"],
    ["-q, --quiet", "Suppress non-essential output"],
    ["--choose-model", "Choose AI model before generating"],
    ["--provider <name>", "AI provider (gemini/openai)"],
    ["--model <name>", "Specific AI model to use"],
    ["--no-banner", "Suppress the ASCII banner"],
  ];

  opts.forEach(([flag, desc]) => {
    console.log(`  ${chalk.yellow(flag.padEnd(22))} ${desc}`);
  });

  console.log(chalk.cyan.bold("\nExamples:"));
  console.log(`  ${chalk.gray("comet")}                        ${chalk.gray("# Generate commit from staged changes")}`);
  console.log(`  ${chalk.gray("comet --push")}                 ${chalk.gray("# Commit and push")}`);
  console.log(`  ${chalk.gray("comet --choose-model")}         ${chalk.gray("# Pick a model interactively")}`);
  console.log(`  ${chalk.gray("comet --dry-run")}              ${chalk.gray("# Preview suggestions only")}`);
  console.log(`  ${chalk.gray("comet review")}                 ${chalk.gray("# AI code review")}`);
  console.log(`  ${chalk.gray("comet explain")}                ${chalk.gray("# Explain changes in plain English")}`);
  console.log(`  ${chalk.gray("comet config")}                 ${chalk.gray("# Configure settings")}`);
  console.log(`  ${chalk.gray("comet history --search fix")}   ${chalk.gray("# Search commit history")}`);
  console.log("");
}

const program = new Command();

program
  .name("comet")
  .version("1.0.8")
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

program
  .command("help")
  .description("Show help message")
  .action(() => {
    showHelp();
  });

program.on("command:*", () => {
  showHelp();
});

export { program };
