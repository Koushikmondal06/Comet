# Comet

> AI-powered commit message generator that reads your staged Git diffs and generates clean, Conventional Commits messages using Gemini or OpenAI.

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
- **Gemini & OpenAI** support
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
# 1. Set your API key (Gemini or OpenAI)
export GEMINI_API_KEY=your_key_here

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
| `comet review` | AI code review of staged changes |
| `comet explain` | Explain staged changes in plain English |
| `comet refactor` | Get AI refactoring suggestions |
| `comet config` | Configure settings |
| `comet history` | View and search commit history |
| `comet history -s <query>` | Search commit history |
| `comet history --clear` | Clear commit history |

### Options

| Flag | Description |
|------|-------------|
| `-p, --push` | Push after commit |
| `-d, --dry-run` | Show suggestions only |
| `-m, --message <msg>` | Use this message directly |
| `-n, --count <n>` | Number of suggestions (default: 3, max: 10) |
| `--choose-model` | Interactively pick an AI model before generating |
| `--style <style>` | Commit message style (e.g. concise, detailed, casual) |
| `-y, --yes` | Auto-confirm (skip prompts) |
| `-q, --quiet` | Suppress non-essential output |
| `--provider <name>` | AI provider: `gemini` or `openai` (also on `review`, `explain`, `refactor`) |
| `--model <name>` | Specific AI model to use (also on `review`, `explain`, `refactor`) |
| `--no-banner` | Suppress the ASCII banner |

---

## Configuration

Run the interactive config wizard:

```bash
comet config
```

Or manually edit `~/.comet/config.json`:

```json
{
  "provider": "gemini",
  "model": "gemini-2.5-flash",
  "emoji": true,
  "autoCommit": false,
  "theme": "dark"
}
```

### Supported Providers

| Provider | API Key | Free Tier |
|----------|---------|-----------|
| **Google Gemini** | `GEMINI_API_KEY` | Yes |
| **OpenAI** | `OPENAI_API_KEY` | No |

Get a Gemini API key for free at [Google AI Studio](https://aistudio.google.com/apikey).

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes (for Gemini) |
| `OPENAI_API_KEY` | OpenAI API key | Yes (for OpenAI) |
| `AI_PROVIDER` | Default provider (`gemini` / `openai`) | No |

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

## License

[MIT](LICENSE)
