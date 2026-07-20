import { AIProvider } from "../types/config";
import { AIContext } from "../types/commit";
import { generateWithGemini } from "./gemini";
import { generateWithOpenAI } from "./openai";
import { buildCommitPrompt } from "./prompts";
import { getEffectiveProvider } from "../config/config";

export interface AIResponse {
  content: string;
}

export function resolveProviderOption(name?: string): AIProvider | undefined {
  if (!name) return undefined;
  if (name !== "gemini" && name !== "openai") {
    throw new Error(`Invalid provider '${name}'. Use 'gemini' or 'openai'.`);
  }
  return name;
}

export async function generateAIResponse(
  prompt: string,
  provider?: AIProvider,
  model?: string
): Promise<AIResponse> {
  const effectiveProvider = provider || getEffectiveProvider();

  switch (effectiveProvider) {
    case "gemini":
      return generateWithGemini(prompt, model);
    case "openai":
      return generateWithOpenAI(prompt, model);
    default:
      throw new Error(`Unknown provider: ${effectiveProvider}`);
  }
}

export interface CommitGenerationOptions {
  count?: number;
  provider?: AIProvider;
  model?: string;
  mood?: string;
  maxLength?: number;
  language?: string;
}

export async function generateCommitSuggestions(
  context: AIContext,
  options: CommitGenerationOptions = {}
): Promise<string> {
  const prompt = buildCommitPrompt(
    context,
    options.count ?? 3,
    options.maxLength ?? 72,
    options.language ?? "en",
    options.mood
  );
  const response = await generateAIResponse(prompt, options.provider, options.model);
  return response.content;
}
