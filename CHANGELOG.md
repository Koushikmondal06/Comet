# Changelog

## 1.2.8 (2026-07-23)

### Fixes
- Fixed bugs and edge cases in prompts, git history, and git status modules (PR #2 by ruyamB)

## 1.2.5 (2026-07-21)

### Fixes
- Improve JSON parsing resilience for malformed AI responses

## 1.2.4 (2026-07-21)

### Fixes
- Hide emojis in commit selection UI when emoji config is disabled

## 1.2.3 (2026-07-21)

### Fixes
- Disable emoji prefix in commit suggestions by default

## 1.2.2 (2026-07-21)

### Features
- `comet config --api-key [provider]` (`-k`) to set or change an API key directly, without going through the config menu

## 1.2.0 (2026-07-20)

### Features
- `--style <style>` flag to set commit message style without `--choose-model`
- `--provider` and `--model` options on `review`, `explain`, and `refactor`
- Config `maxLength` and `language` are now passed to the AI prompt

### Fixes
- Messages are truncated at a word-safe boundary before the emoji prefix is added, so the prefix no longer eats into the length budget
- OpenAI o1/o3 reasoning models now use the correct request shape (no system message/temperature, `max_completion_tokens`)
- `comet refactor` now prompts for a missing API key like other commands
- Diffs containing `$&`-style patterns no longer corrupt the AI prompt
- Unknown commands exit with code 1
- Invalid `-n/--count` values fall back to 3 (capped at 10)
- Parsed AI suggestions are sanitized and validated (control chars stripped, invalid commit types dropped)
- `~/.comet/.env` (API keys) is written with 0600 permissions
- CLI version is read from package.json instead of being hardcoded
- Removed double banner on `review`/`explain`

### Chores
- Much smaller install: dropped `node-fetch` (built-in `fetch`), `figlet` (pre-rendered banner), `dotenv` (tiny built-in parser), `ora` (minimal spinner), and swapped `inquirer` for the lighter `@inquirer/prompts` — 47 packages / ~6 MB installed, down from 61 packages / ~20 MB; Node >= 18 required
- npm package now ships only `dist/` plus README/LICENSE, with repository metadata
- Removed unused cache module and duplicate staging helpers

## 1.0.0 (2026-07-17)

### Features
- AI-powered commit message generation
- Gemini and OpenAI provider support
- Interactive commit selection
- Code review command
- Plain English explanation command
- Commit history tracking
- Configurable settings
- Conventional Commits format
- Emoji prefix support
- Dry run mode
- Auto-push option
