# Architecture

## Overview

Comet is a CLI tool that generates AI-powered commit messages by analyzing git diffs and project context.

## Data Flow

```
User → CLI → Git Module → AI Module → Parser → User Selection → Git Commit
```

## Module Structure

### CLI Layer
- **program.ts**: Commander setup, route commands
- **commands/**: One file per command (commit, review, explain, config, history)
- **prompts/**: Interactive user prompts (inquirer)
- **ui/**: Display components (banner, spinner, colors, table)

### Git Layer
- **diff.ts**: Read staged diffs and changed files
- **status.ts**: Full working tree status
- **branch.ts**: Branch info, recent commits, repo name
- **commit.ts**: Create commits and push
- **history.ts**: Query commit history
- **files.ts**: Read file content from git

### AI Layer
- **provider.ts**: Route requests to provider
- **gemini.ts**: Google Gemini API
- **openai.ts**: OpenAI API
- **prompts.ts**: Build prompts from templates + context
- **parser.ts**: Extract JSON from AI responses

### Config Layer
- **config.ts**: Load/save/update user config
- **defaults.ts**: Default config values

### Storage Layer
- **history.ts**: Commit history persistence
- **cache.ts**: TTL-based response cache

## Key Design Decisions

1. **Provider abstraction**: Swap between Gemini and OpenAI without changing CLI code
2. **Template-based prompts**: Prompts in constants, context injected at runtime
3. **JSON-only AI output**: Forces structured responses for reliable parsing
4. **Local storage**: Config and history stored in `~/.aicommit/`
