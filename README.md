# Comet

> AI-powered commit message generator that reads your staged Git diffs and generates clean, Conventional Commits messages using Gemini, OpenAI, Claude, OpenRouter, Groq, NVIDIA NIM, or any OpenAI- or Anthropic-compatible endpoint.

<p align="center">
  <img src="https://img.shields.io/npm/v/@koushikmondal06/comet?color=blue" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/@koushikmondal06/comet" alt="downloads" />
  <img src="https://img.shields.io/npm/l/@koushikmondal06/comet" alt="license" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-green" alt="node version" />
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/Koushikmondal06/Comet/main/docs/comet-demo.gif" alt="Comet Demo" width="700" />
</p>

---

## Why Comet?

Writing good commit messages takes time. Comet reads your staged changes, understands the context, and gives you multiple suggestions to pick from — all in the Conventional Commits format with optional emoji prefixes.

---

## Features

- **Smart commit messages** from staged diffs
- **Multiple suggestions** — pick the best one
- **Code review** — get AI feedback on your staged changes
- **Explain changes** — plain English summary of what changed
- **Refactor suggestions** — AI-powered improvement ideas
- **Commit history** — browse and search past commits
- **7 providers** — Gemini, OpenAI, Claude (Anthropic), OpenRouter, Groq, NVIDIA NIM, or any custom OpenAI/Anthropic-compatible endpoint (Ollama, LM Studio, vLLM, Claude proxies...)
- **Claude Code integration** — have Claude Code installed? Comet can use its login, no API key needed
- **Live model lists** — `--choose-model` fetches available models straight from your provider's API
- **Emoji prefixes** — optional Conventional Commits + emoji
- **Lightweight** — zero config, works out of the box

---

## Install

```bash
npm install -g @koushikmondal06/comet
```

---

## Quick Start

```bash
# 1. Set your API key (Gemini is the default provider)
export GEMINI_API_KEY=your_key_here

# ...or connect a different provider interactively
comet config --provider claude

# 2. Stage your changes
git add .

# 3. Generate a commit
comet

# 4. Or commit and push in one go
comet --push
```

---

## Commands

| Command | Description |
|---------|-------------|
| `comet` | Generate and create an AI-powered commit (default command) |
| `comet commit` | Same as `comet` — generate and create a commit |
| `comet --push` | Commit and push to remote |
| `comet --dry-run` | Show suggestions without committing |
| `comet -m "msg"` | Skip selection, use provided message |
| `comet --choose-model` | Pick a model interactively — list fetched live from your provider's API |
| `comet review` | AI code review of staged changes |
| `comet explain` | Explain staged changes in plain English |
| `comet refactor` | Get AI refactoring suggestions |
| `comet config` | Configure settings (interactive menu) |
| `comet config --provider <name>` | Connect/switch AI provider (`gemini`/`openai`/`claude`/`openrouter`/`groq`/`nim`/`custom`) |
| `comet config --api-key [provider]` | Set/change an API key for any provider |
| `comet history` | View and search commit history |
| `comet history -s <query>` | Search commit history |
| `comet history --clear` | Clear commit history |
| `comet help` | Show help message |
| `comet --version` | Show installed version |

`review`, `explain`, and `refactor` also accept `--provider <name>` and `--model <name>`.

### Options

| Flag | Description |
|------|-------------|
| `-p, --push` | Push after commit |
| `-d, --dry-run` | Show suggestions only |
| `-m, --message <msg>` | Use this message directly |
| `-n, --count <n>` | Number of suggestions (default: 3, max: 10) |
| `--choose-model` | Interactively pick an AI model (fetched live from your provider's API) |
| `--style <style>` | Commit message style (e.g. concise, detailed, casual) |
| `-y, --yes` | Auto-confirm (skip prompts) |
| `-q, --quiet` | Suppress non-essential output |
| `--provider <name>` | AI provider: `gemini`/`openai`/`claude`/`openrouter`/`groq`/`nim`/`custom` (also on `review`, `explain`, `refactor`) |
| `--model <name>` | Specific AI model to use (also on `review`, `explain`, `refactor`) |
| `--no-banner` | Suppress the ASCII banner |

---

## Configuration

Run the interactive config wizard:

```bash
comet config
```

Connect or switch a provider directly:

```bash
comet config --provider claude      # or gemini/openai/openrouter/groq/nim/custom
```

Or manually edit `~/.comet/config.json`:

```json
{
  "provider": "claude",
  "model": "claude-opus-4-8",
  "emoji": true,
  "autoCommit": false,
  "theme": "dark",
  "customBaseUrl": "http://localhost:11434/v1",
  "claudeBackend": "claude-code"
}
```

`customBaseUrl` only applies to the `custom` provider; `claudeBackend` (`api` / `claude-code`) only to `claude`.

### Supported Providers

| Provider | API Key | Notes |
|----------|---------|-------|
| **Google Gemini** | `GEMINI_API_KEY` | Free tier — get a key at [Google AI Studio](https://aistudio.google.com/apikey) |
| **OpenAI** | `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com/api-keys) |
| **Claude (Anthropic)** | `ANTHROPIC_API_KEY` | Or zero-key via the [Claude Code](https://claude.com/claude-code) CLI — Comet detects it and asks to use its login |
| **OpenRouter** | `OPENROUTER_API_KEY` | One key, hundreds of models — [openrouter.ai/keys](https://openrouter.ai/keys) |
| **Groq** | `GROQ_API_KEY` | Very fast inference, free tier — [console.groq.com/keys](https://console.groq.com/keys) |
| **NVIDIA NIM** | `NVIDIA_API_KEY` | [build.nvidia.com](https://build.nvidia.com) |
| **Custom** | `CUSTOM_API_KEY` | Any OpenAI- or Anthropic-compatible endpoint — set a base URL (Ollama, LM Studio, vLLM, Claude proxies...); API style auto-detected |

### Using Claude Code (no API key)

If the `claude` CLI is installed and logged in, run `comet config --provider claude` — Comet asks *"Can I use your Claude Code?"* and, if you agree, generates commits through your existing Claude Code login. No `ANTHROPIC_API_KEY` needed.

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | For Gemini |
| `OPENAI_API_KEY` | OpenAI API key | For OpenAI |
| `ANTHROPIC_API_KEY` | Anthropic API key | For Claude (unless using Claude Code) |
| `OPENROUTER_API_KEY` | OpenRouter API key | For OpenRouter |
| `GROQ_API_KEY` | Groq API key | For Groq |
| `NVIDIA_API_KEY` | NVIDIA NIM API key | For NIM |
| `CUSTOM_API_KEY` | Key for your custom endpoint | For custom |
| `CUSTOM_BASE_URL` | Base URL of your OpenAI-compatible API | For custom (or set via `comet config`) |
| `AI_PROVIDER` | Default provider (`gemini`/`openai`/`claude`/`openrouter`/`groq`/`nim`/`custom`) | No |

---

## Examples

```bash
# Generate with Gemini (default)
export GEMINI_API_KEY=your_key
git add .
comet

# Use OpenAI instead
export OPENAI_API_KEY=your_key
comet --provider openai

# Use Claude via your Claude Code login (no key)
comet config --provider claude

# Use a local model through Ollama
comet config --provider custom     # base URL: http://localhost:11434/v1

# Pick a model live from your provider's API
comet --choose-model

# Dry run — see suggestions without committing
comet --dry-run

# Code review
comet review

# Explain what changed
comet explain

# Commit and push
comet --push

# Auto-confirm first suggestion
comet -y
```

---

## Development

```bash
git clone https://github.com/Koushikmondal06/Comet.git
cd Comet
npm install
npm run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run dev` | Run in development mode |
| `npm test` | Run tests |
| `npm run lint` | Lint source files |
| `npm run typecheck` | Type-check without emitting |

---

## Contributors

| Name | GitHub |
|------|--------|
| **Koushik Mondal** — author & maintainer | [@Koushikmondal06](https://github.com/Koushikmondal06) |
| **Himanshu Malik** — multi-provider support (Claude, OpenRouter, NVIDIA NIM, custom endpoints) | — |

Contributions welcome — open an issue or PR at [Koushikmondal06/Comet](https://github.com/Koushikmondal06/Comet).

---

## License

[MIT](LICENSE)
