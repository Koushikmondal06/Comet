# CLI Reference

## Commands

### `aicommit` (default)
Generate AI-powered commit messages.

| Flag | Description |
|------|-------------|
| `-p, --push` | Push after committing |
| `-d, --dry-run` | Show suggestions only |
| `--provider <p>` | Override AI provider |
| `--model <m>` | Override AI model |
| `-n, --count <n>` | Number of suggestions (default: 3) |
| `-m, --message <msg>` | Skip selection, use this message |

### `aicommit review`
AI-powered code review of staged changes.

### `aicommit explain`
Explain staged changes in plain English.

### `aicommit config`
Interactive configuration management.

### `aicommit history`
View commit history.

| Flag | Description |
|------|-------------|
| `-s, --search <q>` | Search history |
| `--clear` | Clear all history |

## Configuration

Stored in `~/.aicommit/config.json`:

```json
{
  "provider": "gemini",
  "model": "gemini-2.5-flash",
  "emoji": true,
  "autoCommit": false,
  "theme": "dark",
  "maxLength": 60,
  "language": "en"
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `AI_PROVIDER` | Override default provider |
