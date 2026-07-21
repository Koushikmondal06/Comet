export type AIProvider =
  | "gemini"
  | "openai"
  | "claude"
  | "openrouter"
  | "nim"
  | "custom";

// How the claude provider talks to Anthropic: direct API key, or the
// locally installed Claude Code CLI (uses its existing login, no key needed).
export type ClaudeBackend = "api" | "claude-code";

export interface Config {
  provider: AIProvider;
  model: string;
  emoji: boolean;
  autoCommit: boolean;
  theme: "dark" | "light";
  maxLength: number;
  language: string;
  customBaseUrl?: string;
  claudeBackend?: ClaudeBackend;
}

export interface ConfigOptions {
  provider?: AIProvider;
  model?: string;
  emoji?: boolean;
  autoCommit?: boolean;
  theme?: "dark" | "light";
  maxLength?: number;
  language?: string;
  customBaseUrl?: string;
  claudeBackend?: ClaudeBackend;
}
