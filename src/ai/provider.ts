import { AIProvider } from "../types/config";
import { AIContext } from "../types/commit";
import { generateWithGemini } from "./gemini";
import { generateWithOpenAI } from "./openai";
import { buildCommitPrompt } from "./prompts";
import { getEffectiveProvider } from "../config/config";

export interface AIResponse {
  content: string;
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

export async function generateCommitSuggestions(
  context: AIContext,
  count: number = 3,
  provider?: AIProvider,
  model?: string,
  mood?: string
): Promise<string> {
  const prompt = buildCommitPrompt(context, count, undefined, undefined, mood);
  const response = await generateAIResponse(prompt, provider, model);
  return response.content;
}
