import { Command } from "commander";
import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { commitCommand } from "./commands/commit";
import { reviewCommand, AIOptions } from "./commands/review";
import { explainCommand } from "./commands/explain";
import { configCommand } from "./commands/config";
import { historyCommand, HistoryCommandOptions } from "./commands/history";
import { refactorCommand } from "./commands/refactor";
import { showBanner } from "./ui/banner";

function getVersion(): string {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf-8")
    );
    return pkg.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

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
    ["-n, --count <n>", "Number of suggestions (default: 3, max: 10)"],
    ["-y, --yes", "Auto-confirm (skip prompts)"],
    ["-q, --quiet", "Suppress non-essential output"],
    ["--choose-model", "Choose AI model before generating"],
    ["--style <style>", "Commit message style (concise, detailed, casual...)"],
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
  .version(getVersion(), "-v, --version")
  .description("AI-powered commit message generator")
  .option("--no-banner", "Suppress the ASCII banner")
  .helpOption(false);

program
  .option("-h, --help", "Display help for command", () => {
    showHelp();
    process.exit(0);
  });

program
  .command("commit", { isDefault: true })
  .description("Generate and create an AI-powered commit")
  .argument("[args...]")
  .option("-p, --push", "Push after commit")
  .option("-d, --dry-run", "Show suggestions without committing")
  .option("-m, --message <message>", "Skip selection, use this message")
  .option("--provider <provider>", "AI provider (gemini/openai)")
  .option("--model <model>", "AI model to use")
  .option("-n, --count <count>", "Number of suggestions", "3")
  .option("--choose-model", "Choose AI model before generating")
  .option("--style <style>", "Commit message style (e.g. concise, detailed, casual)")
  .option("-y, --yes", "Auto-confirm (skip confirmation prompts)")
  .option("-q, --quiet", "Suppress non-essential output")
  .action(async (args: string[], options) => {
    // Unrecognized subcommands land here because commit is the default command
    if (args.length > 0) {
      console.error(chalk.red(`Unknown command: ${args[0]}\n`));
      showHelp();
      process.exit(1);
    }
    if (program.opts().banner !== false) showBanner();
    await commitCommand(options);
  });

program
  .command("review")
  .description("AI-powered code review of staged changes")
  .option("--provider <provider>", "AI provider (gemini/openai)")
  .option("--model <model>", "AI model to use")
  .action(async (options: AIOptions) => {
    if (program.opts().banner !== false) showBanner();
    await reviewCommand(options);
  });

program
  .command("explain")
  .description("Explain staged changes in plain English")
  .option("--provider <provider>", "AI provider (gemini/openai)")
  .option("--model <model>", "AI model to use")
  .action(async (options: AIOptions) => {
    if (program.opts().banner !== false) showBanner();
    await explainCommand(options);
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
  .option("--provider <provider>", "AI provider (gemini/openai)")
  .option("--model <model>", "AI model to use")
  .action(async (options: AIOptions) => {
    if (program.opts().banner !== false) showBanner();
    await refactorCommand(options);
  });

program
  .command("help")
  .description("Show help message")
  .action(() => {
    showHelp();
  });

program.on("command:*", (operands) => {
  console.error(chalk.red(`Unknown command: ${operands[0]}\n`));
  showHelp();
  process.exit(1);
});

export { program };
