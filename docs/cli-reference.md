# CLI Reference

## Commands

### `comet` (default)
Generate AI-powered commit messages.

| Flag | Description |
|------|-------------|
| `-p, --push` | Push after committing |
| `-d, --dry-run` | Show suggestions only |
| `--provider <p>` | Override AI provider (`gemini`/`openai`/`claude`/`openrouter`/`groq`/`nim`/`custom`) |
| `--model <m>` | Override AI model |
| `--choose-model` | Pick a model interactively (list fetched live from the provider's API) |
| `-n, --count <n>` | Number of suggestions (default: 3) |
| `-m, --message <msg>` | Skip selection, use this message |

### `comet review`
AI-powered code review of staged changes.

### `comet explain`
Explain staged changes in plain English.

### `comet config`
Interactive configuration management.

| Flag | Description |
|------|-------------|
| `-p, --provider <name>` | Connect/switch provider (`gemini`/`openai`/`claude`/`openrouter`/`groq`/`nim`/`custom`). Custom prompts for a base URL; Claude offers to use an installed Claude Code CLI (no API key) |
| `-k, --api-key [provider]` | Set an API key (defaults to current provider) |

### `comet history`
View commit history.

| Flag | Description |
|------|-------------|
| `-s, --search <q>` | Search history |
| `--clear` | Clear all history |

## Configuration

Stored in `~/.comet/config.json`:

```json
{
  "provider": "gemini",
  "model": "gemini-2.5-flash",
  "emoji": true,
  "autoCommit": false,
  "theme": "dark",
  "maxLength": 60,
  "language": "en",
  "customBaseUrl": "http://localhost:11434/v1",
  "claudeBackend": "api"
}
```

`customBaseUrl` — only for the `custom` provider (any OpenAI-compatible `/v1` API).
`claudeBackend` — `api` (uses `ANTHROPIC_API_KEY`) or `claude-code` (shells out to the installed Claude Code CLI, no key).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic (Claude) API key |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `GROQ_API_KEY` | Groq API key |
| `NVIDIA_API_KEY` | NVIDIA NIM API key |
| `CUSTOM_API_KEY` | Key for a custom OpenAI-compatible endpoint |
| `CUSTOM_BASE_URL` | Base URL for the custom provider |
| `AI_PROVIDER` | Override default provider (`gemini`/`openai`/`claude`/`openrouter`/`groq`/`nim`/`custom`) |
