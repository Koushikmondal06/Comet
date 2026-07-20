export const PROMPTS = {
  commit: `You are an expert git commit message generator. Analyze the following git context and generate commit messages following the Conventional Commits specification.

## Context
- Repository: {repository}
- Branch: {branch}
- Recent commits:
{recentCommits}

## Changed Files
{changedFiles}

## Git Diff
\`\`\`
{diff}
\`\`\`

## Rules
1. Use Conventional Commits format: type(scope): description
2. Maximum {max_length} characters for the subject line
3. Use imperative mood (add, fix, remove, not added, fixed, removed)
4. If the project uses emojis, include the appropriate emoji prefix
5. Be specific and descriptive
6. Focus on the "what" and "why", not the "how"
7. Write the messages in this language: {language}

## Writing Style
Write commit messages in this style: {mood}

## Output Format
Return a JSON array with exactly {count} commit message suggestions:
[
  {
    "message": "type(scope): description with emoji",
    "type": "feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert",
    "scope": "optional scope",
    "description": "brief explanation of the change"
  }
]

Return ONLY the JSON array, no additional text.`,

  review: `You are an expert code reviewer. Analyze the following staged changes and provide a thorough code review.

## Changed Files
{changedFiles}

## Git Diff
\`\`\`
{diff}
\`\`\`

## Rules
1. Identify potential bugs, security issues, and performance problems
2. Suggest improvements for code quality and readability
3. Check for proper error handling
4. Verify naming conventions are consistent
5. Look for potential edge cases

## Output Format
Return a JSON object:
{
  "summary": "Brief summary of the changes",
  "issues": [
    {
      "severity": "critical|warning|info",
      "file": "path/to/file",
      "line": "optional line reference",
      "message": "Description of the issue",
      "suggestion": "How to fix it"
    }
  ],
  "score": 85
}`,

  explain: `You are a technical documentation expert. Explain the following staged changes in plain English that a non-developer could understand.

## Changed Files
{changedFiles}

## Git Diff
\`\`\`
{diff}
\`\`\`

## Rules
1. Use simple, non-technical language
2. Explain the purpose and impact of the changes
3. Use analogies when helpful
4. Break down complex changes into simple steps

## Output Format
Return a JSON object:
{
  "summary": "One-sentence summary",
  "explanation": "Detailed explanation in plain English",
  "impact": "What impact these changes have on the application",
  "category": "bug-fix|new-feature|improvement|cleanup|security"
}`,

  refactor: `You are a senior software engineer specializing in code refactoring. Analyze the following code and suggest refactoring improvements.

## Git Diff
\`\`\`
{diff}
\`\`\`

## Output Format
Return a JSON object:
{
  "summary": "Brief summary of the overall code quality",
  "suggestions": [
    {
      "file": "path/to/file",
      "issue": "What's wrong with the current code",
      "suggestion": "How to improve it",
      "priority": "high|medium|low"
    }
  ]
}

Return ONLY the JSON object, no additional text.`,
} as const;
