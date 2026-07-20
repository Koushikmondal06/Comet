import { execFileSync } from "child_process";

export function getCurrentBranch(): string {
  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    return "unknown";
  }
}

export function getRecentCommits(count: number = 10): string[] {
  try {
    const output = execFileSync("git", ["log", "--oneline", `-${count}`], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();

    if (!output) return [];
    return output.split("\n").filter((line) => line.trim());
  } catch {
    return [];
  }
}

export function getRepoName(): string {
  try {
    const remoteUrl = execFileSync("git", ["remote", "get-url", "origin"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    const match = remoteUrl.match(/[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
    return match ? match[1] : "unknown";
  } catch {
    return "unknown";
  }
}

export function isGitRepo(): boolean {
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return true;
  } catch {
    return false;
  }
}
