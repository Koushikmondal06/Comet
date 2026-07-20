import { select, password } from "@inquirer/prompts";
import { loadConfig, resetConfig, updateConfig } from "../../config/config";
import { logger } from "../../utils/logger";
import { printTable } from "../ui/table";
import { AIProvider } from "../../types/config";
import { saveApiKeyToEnv } from "../../utils/env";
import { getModelsForProvider } from "../../constants/models";

export async function configCommand(): Promise<void> {
  const config = loadConfig();

  const action = await select({
    message: "What would you like to do?",
    choices: [
      { name: "View current config", value: "view" },
      { name: "Set API key", value: "apikey" },
      { name: "Set provider (gemini/openai)", value: "provider" },
      { name: "Set AI model", value: "model" },
      { name: "Toggle emoji prefix", value: "emoji" },
      { name: "Toggle auto-commit", value: "autoCommit" },
      { name: "Set theme (dark/light)", value: "theme" },
      { name: "Reset to defaults", value: "reset" },
    ],
  });

  switch (action) {
    case "view": {
      logger.blank();
      logger.bold("Current Configuration:");
      logger.blank();
      const keyStatus =
        config.provider === "gemini"
          ? process.env.GEMINI_API_KEY
            ? "Set"
            : "Not set"
          : process.env.OPENAI_API_KEY
            ? "Set"
            : "Not set";
      printTable(
        ["Key", "Value"],
        [
          ["Provider", config.provider],
          ["Model", config.model],
          ["API Key", keyStatus],
          ["Emoji", config.emoji ? "ON" : "OFF"],
          ["Auto-commit", config.autoCommit ? "ON" : "OFF"],
          ["Theme", config.theme],
          ["Max Length", config.maxLength.toString()],
          ["Language", config.language],
        ]
      );
      break;
    }

    case "apikey": {
      const provider = await select<AIProvider>({
        message: "Which provider's key do you want to set?",
        choices: [
          { name: "Gemini", value: "gemini" },
          { name: "OpenAI", value: "openai" },
        ],
      });
      const keyUrl =
        provider === "gemini"
          ? "https://aistudio.google.com/apikey"
          : "https://platform.openai.com/api-keys";
      logger.info(`Get your key at: ${keyUrl}`);
      const apiKey = await password({
        message: `Enter your ${provider} API key:`,
        mask: "*",
        validate: (value: string) =>
          value.trim().length > 0 || "API key cannot be empty",
      });
      saveApiKeyToEnv(provider, apiKey.trim());
      logger.success(`${provider} API key saved!`);
      break;
    }

    case "provider": {
      const provider = await select<AIProvider>({
        message: "Select AI provider:",
        choices: [
          { name: "Gemini", value: "gemini" },
          { name: "OpenAI", value: "openai" },
        ],
      });
      updateConfig({ provider });
      logger.success(`Provider set to ${provider}`);
      break;
    }

    case "model": {
      const model = await select({
        message: `Select ${config.provider} model:`,
        choices: getModelsForProvider(config.provider),
      });
      updateConfig({ model });
      logger.success(`Model set to ${model}`);
      break;
    }

    case "emoji": {
      updateConfig({ emoji: !config.emoji });
      logger.success(`Emoji ${config.emoji ? "disabled" : "enabled"}`);
      break;
    }

    case "autoCommit": {
      updateConfig({ autoCommit: !config.autoCommit });
      logger.success(`Auto-commit ${config.autoCommit ? "disabled" : "enabled"}`);
      break;
    }

    case "theme": {
      const theme = await select<"dark" | "light">({
        message: "Select theme:",
        choices: [
          { name: "Dark", value: "dark" },
          { name: "Light", value: "light" },
        ],
      });
      updateConfig({ theme });
      logger.success(`Theme set to ${theme}`);
      break;
    }

    case "reset": {
      resetConfig();
      logger.success("Configuration reset to defaults");
      break;
    }
  }
}
