import { select, password, input, confirm } from "@inquirer/prompts";
import { loadConfig, resetConfig, updateConfig } from "../../config/config";
import { logger } from "../../utils/logger";
import { printTable } from "../ui/table";
import { AIProvider, Config } from "../../types/config";
import { saveApiKeyToEnv, hasClaudeCode } from "../../utils/env";
import { getModelsForProvider } from "../../constants/models";
import { getModelChoices } from "../../ai/listModels";
import { detectCustomEndpoint } from "../../ai/detectCustom";
import { withSpinner } from "../ui/spinner";
import {
  PROVIDERS,
  PROVIDER_NAMES,
  isProvider,
  providerListText,
} from "../../constants/providers";

export interface ConfigCommandOptions {
  apiKey?: string | boolean;
  provider?: string;
}

function providerChoices() {
  return PROVIDER_NAMES.map((p) => ({ name: PROVIDERS[p].label, value: p }));
}

async function promptAndSaveApiKey(preselected?: AIProvider): Promise<void> {
  const provider =
    preselected ||
    (await select<AIProvider>({
      message: "Which provider's key do you want to set?",
      choices: providerChoices(),
    }));
  const info = PROVIDERS[provider];
  if (info.keyUrl) {
    logger.info(`Get your key at: ${info.keyUrl}`);
  }
  const apiKey = await password({
    message: `Enter your ${info.label} API key:`,
    mask: "*",
    validate: (value: string) =>
      value.trim().length > 0 || "API key cannot be empty",
  });
  saveApiKeyToEnv(provider, apiKey.trim());
  logger.success(`${info.label} API key saved!`);
}

async function promptModel(provider: AIProvider): Promise<string> {
  const choices = getModelsForProvider(provider);
  if (choices.length === 0) {
    return (
      await input({
        message: "Model id (leave blank to use your endpoint's default):",
      })
    ).trim();
  }
  return select({
    message: `Select ${PROVIDERS[provider].label} model:`,
    choices,
  });
}

// Custom endpoint flow: base URL → optional key → auto-detect wire
// protocol (OpenAI vs Anthropic style) → pick a model from the endpoint.
async function connectCustomProvider(): Promise<void> {
  const customBaseUrl = (
    await input({
      message: "Base URL of your endpoint (e.g. http://localhost:11434/v1):",
      default: loadConfig().customBaseUrl,
      validate: (v: string) =>
        /^https?:\/\/.+/.test(v.trim()) || "Enter a http(s) URL",
    })
  ).trim();

  const apiKey = (
    await password({
      message: "API key (leave blank if your endpoint doesn't need one):",
      mask: "*",
    })
  ).trim();
  if (apiKey) saveApiKeyToEnv("custom", apiKey);

  const detected = await withSpinner("Detecting endpoint", async () =>
    detectCustomEndpoint(customBaseUrl, apiKey)
  );

  const updates: Partial<Config> = { provider: "custom" };

  if (detected) {
    updates.customBaseUrl = detected.baseUrl;
    updates.customApi = detected.api;
    logger.success(
      `Detected ${detected.api === "anthropic" ? "Anthropic" : "OpenAI"}-compatible API (${detected.models.length} models)`
    );
    updates.model =
      detected.models.length > 0
        ? await select({ message: "Select model:", choices: detected.models })
        : (
            await input({
              message: "Model id (leave blank to use your endpoint's default):",
            })
          ).trim();
  } else {
    logger.warn("Could not auto-detect the endpoint type.");
    updates.customBaseUrl = customBaseUrl;
    updates.customApi = await select({
      message: "Which API style does your endpoint speak?",
      choices: [
        { name: "OpenAI-compatible (/chat/completions)", value: "openai" as const },
        { name: "Anthropic-compatible (/messages)", value: "anthropic" as const },
      ],
    });
    updates.model = (
      await input({
        message: "Model id (leave blank to use your endpoint's default):",
      })
    ).trim();
  }

  updateConfig(updates);
  logger.success(
    `Provider set to Custom (${updates.customApi}) — model: ${updates.model || "endpoint default"}`
  );
}

// Shared by the interactive menu and `comet config --provider <name>`
async function connectProvider(preselected?: AIProvider): Promise<void> {
  const provider =
    preselected ||
    (await select<AIProvider>({
      message: "Select AI provider:",
      choices: providerChoices(),
    }));

  if (provider === "custom") {
    await connectCustomProvider();
    return;
  }

  const info = PROVIDERS[provider];
  const updates: Partial<Config> = { provider };

  // Claude: offer the local Claude Code CLI before asking for a key
  if (provider === "claude" && hasClaudeCode()) {
    const useClaudeCode = await confirm({
      message:
        "Claude Code detected on this machine. Can I use your Claude Code? (uses its login, no API key needed)",
      default: true,
    });
    updates.claudeBackend = useClaudeCode ? "claude-code" : "api";
  }

  updates.model = info.defaultModel || (await promptModel(provider));
  updateConfig(updates);
  logger.success(`Provider set to ${info.label} (model: ${updates.model})`);

  // Prompt for a key unless claude-code covers it or one is already set
  const needsKey =
    updates.claudeBackend !== "claude-code" && !process.env[info.envVar];
  if (needsKey) {
    const setNow = await confirm({
      message: `No ${info.envVar} found. Set the API key now?`,
      default: true,
    });
    if (setNow) {
      await promptAndSaveApiKey(provider);
    }
  }
}

export async function configCommand(
  options: ConfigCommandOptions = {}
): Promise<void> {
  const config = loadConfig();

  // --provider <name>: switch/connect a provider directly
  if (options.provider) {
    if (!isProvider(options.provider)) {
      logger.error(
        `Invalid provider '${options.provider}'. Use one of: ${providerListText()}.`
      );
      process.exit(1);
    }
    await connectProvider(options.provider);
    return;
  }

  // --api-key [provider]: jump straight to the key prompt
  if (options.apiKey) {
    let provider: AIProvider | undefined;
    if (typeof options.apiKey === "string") {
      if (!isProvider(options.apiKey)) {
        logger.error(
          `Invalid provider '${options.apiKey}'. Use one of: ${providerListText()}.`
        );
        process.exit(1);
      }
      provider = options.apiKey;
    } else {
      provider = config.provider;
    }
    await promptAndSaveApiKey(provider);
    return;
  }

  const action = await select({
    message: "What would you like to do?",
    choices: [
      { name: "View current config", value: "view" },
      { name: "Set API key", value: "apikey" },
      { name: `Connect provider (${providerListText()})`, value: "provider" },
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
      const info = PROVIDERS[config.provider];
      const keyStatus =
        config.provider === "claude" && config.claudeBackend === "claude-code"
          ? "Claude Code (no key needed)"
          : process.env[info.envVar]
            ? "Set"
            : "Not set";
      const rows: [string, string][] = [
        ["Provider", info.label],
        ["Model", config.model],
        ["API Key", keyStatus],
        ["Emoji", config.emoji ? "ON" : "OFF"],
        ["Auto-commit", config.autoCommit ? "ON" : "OFF"],
        ["Theme", config.theme],
        ["Max Length", config.maxLength.toString()],
        ["Language", config.language],
      ];
      if (config.provider === "custom") {
        rows.splice(2, 0,
          ["Base URL", config.customBaseUrl || "Not set"],
          ["API Style", config.customApi || "openai"]
        );
      }
      printTable(["Key", "Value"], rows);
      break;
    }

    case "apikey": {
      await promptAndSaveApiKey();
      break;
    }

    case "provider": {
      await connectProvider();
      break;
    }

    case "model": {
      const staticChoices = getModelsForProvider(config.provider);
      let choices = staticChoices;
      try {
        choices = await getModelChoices(config.provider);
      } catch {
        // no key yet / offline — static list is fine
      }
      const model =
        choices.length === 0
          ? await promptModel(config.provider)
          : await select({
              message: `Select ${config.provider} model:`,
              choices,
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
