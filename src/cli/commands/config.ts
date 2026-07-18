import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig, saveConfig, resetConfig, updateConfig } from "../../config/config";
import { showBanner } from "../ui/banner";
import { logger } from "../../utils/logger";
import { printTable } from "../ui/table";
import { AIProvider } from "../../types/config";
import { saveApiKeyToEnv } from "../../utils/env";

export async function configCommand(): Promise<void> {
  showBanner();

  const config = loadConfig();

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
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
    },
  ]);

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
      const { provider } = await inquirer.prompt([
        {
          type: "list",
          name: "provider",
          message: "Which provider's key do you want to set?",
          choices: [
            { name: "Gemini", value: "gemini" },
            { name: "OpenAI", value: "openai" },
          ],
        },
      ]);
      const keyUrl =
        provider === "gemini"
          ? "https://aistudio.google.com/apikey"
          : "https://platform.openai.com/api-keys";
      logger.info(`Get your key at: ${keyUrl}`);
      const { apiKey } = await inquirer.prompt([
        {
          type: "password",
          name: "apiKey",
          message: `Enter your ${provider} API key:`,
          mask: "*",
          validate: (input: string) =>
            input.trim().length > 0 || "API key cannot be empty",
        },
      ]);
      saveApiKeyToEnv(provider as AIProvider, apiKey.trim());
      logger.success(`${provider} API key saved!`);
      break;
    }

    case "provider": {
      const { provider } = await inquirer.prompt([
        {
          type: "list",
          name: "provider",
          message: "Select AI provider:",
          choices: [
            { name: "Gemini", value: "gemini" },
            { name: "OpenAI", value: "openai" },
          ],
        },
      ]);
      updateConfig({ provider: provider as AIProvider });
      logger.success(`Provider set to ${provider}`);
      break;
    }

    case "model": {
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
      const { model } = await inquirer.prompt([
        {
          type: "list",
          name: "model",
          message: `Select ${config.provider} model:`,
          choices: models,
        },
      ]);
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
      const { theme } = await inquirer.prompt([
        {
          type: "list",
          name: "theme",
          message: "Select theme:",
          choices: [
            { name: "Dark", value: "dark" },
            { name: "Light", value: "light" },
          ],
        },
      ]);
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
