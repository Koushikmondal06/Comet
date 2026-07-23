import { AIProvider } from "../types/config";
import { AIContext } from "../types/commit";
import { generateWithGemini } from "./gemini";
import { generateWithOpenAI } from "./openai";
import { generateWithClaude, generateWithAnthropicCompatible } from "./claude";
import { loadConfig } from "../config/config";
import { buildCommitPrompt } from "./prompts";
import { getEffectiveProvider } from "../config/config";
import { isProvider, providerListText } from "../constants/providers";

export interface AIResponse {
  content: string;
}

export function resolveProviderOption(name?: string): AIProvider | undefined {
  if (!name) return undefined;
  if (!isProvider(name)) {
    throw new Error(
      `Invalid provider '${name}'. Use one of: ${providerListText()}.`
    );
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
    case "claude":
      return generateWithClaude(prompt, model);
    case "custom":
      // Custom endpoints can speak either wire protocol
      if (loadConfig().customApi === "anthropic") {
        return generateWithAnthropicCompatible(prompt, model);
      }
      return generateWithOpenAI(prompt, model, "custom");
    case "openai":
    case "openrouter":
    case "groq":
    case "nim":
      return generateWithOpenAI(prompt, model, effectiveProvider);
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
