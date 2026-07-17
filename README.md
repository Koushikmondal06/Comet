# Comet

AI-powered commit message generator CLI. Reads your staged git changes, understands the context, and generates Conventional Commits messages using Gemini or OpenAI.

## Features

- Generate commit messages from staged diffs
- Interactive selection from multiple suggestions
- Code review of staged changes
- Plain English explanation of changes
- Commit history tracking
- Gemini and OpenAI support
- Conventional Commits format with emoji prefixes

## Install

```bash
npm install -g ai-commit
```

## Quick Start

```bash
# Set your API key
export GEMINI_API_KEY=your_key_here

# Stage changes
git add .

# Generate commit
aicommit

# Commit and push
aicommit --push
```

## Commands

| Command | Description |
|---------|-------------|
| `aicommit` | Generate commit message |
| `aicommit --push` | Commit and push |
| `aicommit --dry-run` | Show suggestions only |
| `aicommit review` | AI code review |
| `aicommit explain` | Explain changes in plain English |
| `aicommit config` | Configure settings |
| `aicommit history` | View commit history |

## Configuration

```bash
aicommit config
```

Or edit `~/.aicommit/config.json`:

```json
{
  "provider": "gemini",
  "model": "gemini-2.5-flash",
  "emoji": true,
  "autoCommit": false,
  "theme": "dark"
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `AI_PROVIDER` | Default provider (gemini/openai) |

## Development

```bash
git clone https://github.com/your-username/Comet.git
cd Comet
npm install
npm run dev
```

## License

MIT
