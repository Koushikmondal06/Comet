export type AIProvider =
  | "gemini"
  | "openai"
  | "claude"
  | "openrouter"
  | "groq"
  | "nim"
  | "custom";

// How the claude provider talks to Anthropic: direct API key, or the
// locally installed Claude Code CLI (uses its existing login, no key needed).
export type ClaudeBackend = "api" | "claude-code";

// Wire protocol of a custom endpoint: OpenAI-style /chat/completions
// or Anthropic-style /messages. Auto-detected at connect time.
export type CustomApiFlavor = "openai" | "anthropic";

export interface Config {
  provider: AIProvider;
  model: string;
  emoji: boolean;
  autoCommit: boolean;
  theme: "dark" | "light";
  maxLength: number;
  language: string;
  customBaseUrl?: string;
  customApi?: CustomApiFlavor;
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
  customApi?: CustomApiFlavor;
  claudeBackend?: ClaudeBackend;
}
