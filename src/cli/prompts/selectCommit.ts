import { select, input } from "@inquirer/prompts";
import { CommitSuggestion } from "../../types/commit";
import { EMOJIS } from "../../constants/emojis";
import chalk from "chalk";

export async function selectCommit(
  suggestions: CommitSuggestion[]
): Promise<CommitSuggestion> {
  const choices = suggestions.map((s, index) => ({
    name: `${chalk.bold(`${index + 1}.`)} ${EMOJIS[s.type] || ""} ${chalk.white(
      s.message
    )}${chalk.gray(`\n     ${s.description}`)}`,
    value: s,
    short: s.message,
  }));

  choices.push({
    name: `${chalk.gray(`${suggestions.length + 1}.`)} ${chalk.yellow(
      "Custom message"
    )}`,
    value: {
      message: "",
      type: "chore" as const,
      description: "Custom commit message",
    },
    short: "Custom",
  });

  const selected = await select<CommitSuggestion>({
    message: "Select a commit message:",
    choices,
    pageSize: 10,
  });

  if (!selected.message) {
    selected.message = await input({
      message: "Enter your commit message:",
      validate: (value: string) => {
        if (value.trim().length === 0) return "Message cannot be empty";
        if (value.length > 100) return "Message too long (max 100 chars)";
        return true;
      },
    });
  }

  return selected;
}
