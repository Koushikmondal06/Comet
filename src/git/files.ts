import { execFileSync } from "child_process";
import { ChangedFile, FileStatus } from "../types/commit";
import { FILE_STATUS_MAP } from "../constants/git";

export function getChangedFiles(): ChangedFile[] {
  try {
    const output = execFileSync("git", ["diff", "--name-status", "HEAD~1"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();

    if (!output) return [];

    return output.split("\n").map((line) => {
      const [status, ...pathParts] = line.split(/\s+/);
      const filePath = pathParts.join(" ");
      return {
        path: filePath,
        status: (FILE_STATUS_MAP[status] || "unknown") as FileStatus,
      };
    });
  } catch {
    return [];
  }
}

export function getFileContent(filePath: string): string | null {
  try {
    return execFileSync("git", ["show", `HEAD:${filePath}`], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    return null;
  }
}

export function getDiffForFile(filePath: string): string {
  try {
    return execFileSync("git", ["diff", "--cached", "--", filePath], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    return "";
  }
}
