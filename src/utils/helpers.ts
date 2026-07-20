export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Thrown by @inquirer/prompts when the user cancels with Ctrl+C
export function isPromptCancel(error: unknown): boolean {
  return error instanceof Error && error.name === "ExitPromptError";
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function extractRepoName(remoteUrl: string): string {
  const match = remoteUrl.match(/[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
  return match ? match[1] : "unknown";
}

export function parseGitStatusLine(
  line: string
): { status: string; path: string } | null {
  if (line.length < 3) return null;
  const indexStatus = line[0];
  const workingTreeStatus = line[1];
  const filePath = line.slice(3).trim();

  if (indexStatus !== " " && indexStatus !== "?") {
    return { status: indexStatus, path: filePath };
  }
  if (workingTreeStatus !== " " && workingTreeStatus !== "?") {
    return { status: workingTreeStatus, path: filePath };
  }
  if (indexStatus === "?" && workingTreeStatus === "?") {
    return { status: "?", path: filePath };
  }
  return null;
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
