import * as path from "path";
import * as fs from "fs";
import { execFileSync } from "child_process";
import { password, confirm } from "@inquirer/prompts";
import { AIProvider } from "../types/config";
import { loadConfig, updateConfig } from "../config/config";
import { PROVIDERS, isProvider } from "../constants/providers";
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
  if (provider && isProvider(provider)) {
    return provider;
  }
  return undefined;
}

// True when the Claude Code CLI is installed (and therefore already logged in
// or able to prompt its own login) — lets the claude provider run key-less.
export function hasClaudeCode(): boolean {
  try {
    execFileSync("claude", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
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

  const envVarName = PROVIDERS[provider].envVar;
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
  const envVarName = PROVIDERS[provider].envVar;
  const key = process.env[envVarName];
  if (key) return key;

  loadLocalEnv();
  if (process.env[envVarName]) return process.env[envVarName]!;

  // Custom endpoints (e.g. local Ollama) may not need a key at all
  if (provider === "custom") return "";

  throw new Error(`Missing ${envVarName}. Run 'comet config' to set it.`);
}

export async function ensureApiKey(providerOverride?: AIProvider): Promise<void> {
  const config = loadConfig();
  const provider = providerOverride || config.provider;

  // Claude via the local Claude Code CLI needs no key
  if (provider === "claude" && config.claudeBackend === "claude-code") return;

  // Custom endpoints may be keyless; key (if any) is collected at connect time
  if (provider === "custom") return;

  const info = PROVIDERS[provider];

  if (process.env[info.envVar]) return;

  loadLocalEnv();
  if (process.env[info.envVar]) return;

  // No key yet — if Claude Code is installed, offer to use it instead
  if (provider === "claude" && hasClaudeCode()) {
    const useClaudeCode = await confirm({
      message:
        "Claude Code detected on this machine. Can I use your Claude Code? (uses its login, no API key needed)",
      default: true,
    });
    if (useClaudeCode) {
      updateConfig({ claudeBackend: "claude-code" });
      return;
    }
    updateConfig({ claudeBackend: "api" });
  }

  console.log(`\nNo ${info.label} API key found.`);
  if (info.keyUrl) {
    console.log(`Get one at: ${info.keyUrl}`);
  }
  console.log("");

  const apiKey = await password({
    message: `Enter your ${info.label} API key:`,
    mask: "*",
    validate: (value: string) =>
      value.trim().length > 0 || "API key cannot be empty",
  });

  saveApiKeyToEnv(provider, apiKey.trim());
  console.log(`\nAPI key saved to ${getEnvFilePath()}\n`);
}
