# Prompt Design

## Principles

1. **Rich context**: Send diff + branch + recent commits + file list
2. **Structured output**: Force JSON responses for reliable parsing
3. **Conventional Commits**: Enforce standard format
4. **Imperative mood**: "add" not "added"

## Commit Prompt

The commit prompt receives:
- Repository name
- Current branch
- Last 5 commits
- Changed file list with status
- Full staged diff

Returns: JSON array of commit suggestions with type, scope, message, description.

## Review Prompt

Receives same context as commit prompt.
Returns: Summary, issues list with severity/file/message/suggestion, score.

## Explain Prompt

Receives same context.
Returns: Summary, plain English explanation, impact, category.

## Refactor Prompt

Receives diff only.
Returns: Array of refactoring suggestions with file, issue, suggestion, priority.
