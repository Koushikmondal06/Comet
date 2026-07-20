import * as path from "path";
import * as fs from "fs";
import { password } from "@inquirer/prompts";
import { AIProvider } from "../types/config";
import { loadConfig } from "../config/config";
import { getConfigDir } from "./files";

// Minimal .env parser (KEY=value lines); replaces the dotenv dependency.
// Existing process.env values are never overwritten.
function loadEnvFile(filePath: string): void {
  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    return;
  }

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(process.cwd(), ".env"));

function getEnvFilePath(): string {
  return path.join(getConfigDir(), ".env");
}

function loadLocalEnv(): void {
  loadEnvFile(getEnvFilePath());
}

loadLocalEnv();

export function getEnvVar(name: string): string | undefined {
  return process.env[name];
}

export function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Set it in .env or export it.`
    );
  }
  return value;
}

export function getGeminiApiKey(): string | undefined {
  return getEnvVar("GEMINI_API_KEY");
}

export function getOpenAIApiKey(): string | undefined {
  return getEnvVar("OPENAI_API_KEY");
}

export function getProviderFromEnv(): AIProvider | undefined {
  const provider = getEnvVar("AI_PROVIDER");
  if (provider === "gemini" || provider === "openai") {
    return provider;
  }
  return undefined;
}

export function saveApiKeyToEnv(provider: AIProvider, apiKey: string): void {
  const envPath = getEnvFilePath();
  const configDir = getConfigDir();

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  }

  const envVarName = provider === "gemini" ? "GEMINI_API_KEY" : "OPENAI_API_KEY";
  const regex = new RegExp(`^${envVarName}=.*$`, "m");

  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${envVarName}=${apiKey}`);
  } else {
    envContent = envContent.trim() + `\n${envVarName}=${apiKey}\n`;
  }

  fs.writeFileSync(envPath, envContent.trim() + "\n", { encoding: "utf-8", mode: 0o600 });
  fs.chmodSync(envPath, 0o600);
  process.env[envVarName] = apiKey;
}

export function getApiKeyForProvider(provider: AIProvider): string {
  const envVarName = provider === "gemini" ? "GEMINI_API_KEY" : "OPENAI_API_KEY";
  const key = process.env[envVarName];
  if (key) return key;

  loadLocalEnv();
  if (process.env[envVarName]) return process.env[envVarName]!;

  throw new Error(`Missing ${envVarName}. Run 'comet config' to set it.`);
}

export async function ensureApiKey(providerOverride?: AIProvider): Promise<void> {
  const config = loadConfig();
  const provider = providerOverride || config.provider;
  const envVarName = provider === "gemini" ? "GEMINI_API_KEY" : "OPENAI_API_KEY";

  if (process.env[envVarName]) return;

  loadLocalEnv();
  if (process.env[envVarName]) return;

  const providerLabel = provider === "gemini" ? "Gemini" : "OpenAI";
  const keyUrl =
    provider === "gemini"
      ? "https://aistudio.google.com/apikey"
      : "https://platform.openai.com/api-keys";

  console.log(`\nNo ${providerLabel} API key found.`);
  console.log(`Get one at: ${keyUrl}\n`);

  const apiKey = await password({
    message: `Enter your ${providerLabel} API key:`,
    mask: "*",
    validate: (value: string) =>
      value.trim().length > 0 || "API key cannot be empty",
  });

  saveApiKeyToEnv(provider, apiKey.trim());
  console.log(`\nAPI key saved to ${getEnvFilePath()}\n`);
}
