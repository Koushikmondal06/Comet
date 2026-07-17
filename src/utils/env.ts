import * as dotenv from "dotenv";
import { AIProvider } from "../types/config";

dotenv.config();

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

export function getApiKeyForProvider(provider: AIProvider): string {
  switch (provider) {
    case "gemini":
      return requireEnvVar("GEMINI_API_KEY");
    case "openai":
      return requireEnvVar("OPENAI_API_KEY");
  }
}
