import { execFileSync } from "child_process";
import { ChangedFile, FileStatus, GitStatus } from "../types/commit";
import { FILE_STATUS_MAP } from "../constants/git";
import { getCurrentBranch } from "./branch";

function parseStatusOutput(output: string): ChangedFile[] {
  if (!output.trim()) return [];
  return output
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const statusChar = line[0];
      const filePath = line.slice(3).trim();
      const status = (FILE_STATUS_MAP[statusChar] || "modified") as FileStatus;
      return { path: filePath, status };
    });
}

export function getGitStatus(): GitStatus {
  const branch = getCurrentBranch();
  const staged = parseStagedStatus();
  const modified = parseModifiedStatus();
  const untracked = parseUntrackedFiles();

  return { branch, staged, modified, untracked };
}

function parseStagedStatus(): ChangedFile[] {
  try {
    const output = execFileSync("git", ["diff", "--cached", "--name-status"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return parseStatusOutput(output);
  } catch {
    return [];
  }
}

function parseModifiedStatus(): ChangedFile[] {
  try {
    const output = execFileSync("git", ["diff", "--name-status"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return parseStatusOutput(output);
  } catch {
    return [];
  }
}

function parseUntrackedFiles(): string[] {
  try {
    const output = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return output
      .split("\n")
      .filter((line) => line.trim());
  } catch {
    return [];
  }
}

export function hasStagedChanges(): boolean {
  try {
    const output = execFileSync("git", ["diff", "--cached", "--name-only"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    return output.length > 0;
  } catch {
    return false;
  }
}

export function stageAllFiles(): void {
  try {
    execFileSync("git", ["add", "."], { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
  } catch {
    throw new Error("Failed to stage files");
  }
}
