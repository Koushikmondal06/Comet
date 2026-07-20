import { execFileSync } from "child_process";
import { ChangedFile, FileStatus } from "../types/commit";
import { FILE_STATUS_MAP } from "../constants/git";

export function getStagedDiff(): string {
  try {
    return execFileSync("git", ["diff", "--cached"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 10 * 1024 * 1024,
    }).trim();
  } catch {
    return "";
  }
}

export function getStagedDiffStat(): string {
  try {
    return execFileSync("git", ["diff", "--cached", "--stat"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    return "";
  }
}

export function getStagedFiles(): ChangedFile[] {
  try {
    const output = execFileSync(
      "git",
      ["diff", "--cached", "--name-status"],
      { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }
    ).trim();

    if (!output) return [];

    return output
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const [statusChar, ...pathParts] = line.split(/\s+/);
        const filePath = pathParts.join(" ");
        const status = (FILE_STATUS_MAP[statusChar] || "modified") as FileStatus;
        return { path: filePath, status };
      });
  } catch {
    return [];
  }
}
