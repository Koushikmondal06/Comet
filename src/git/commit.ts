import { execFileSync } from "child_process";

export function createCommit(message: string): boolean {
  try {
    execFileSync("git", ["commit", "-m", message], {
      encoding: "utf-8",
      stdio: "pipe",
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    });
    return true;
  } catch (error: any) {
    const stderr = error.stderr ? error.stderr.toString() : "";
    const stdout = error.stdout ? error.stdout.toString() : "";
    const msg = error.message || "";
    const allOutput = stderr || stdout || msg;

    if (allOutput.includes("nothing to commit")) {
      throw new Error("No changes to commit. All files are already committed.");
    }
    if (allOutput.includes("could not find Username")) {
      throw new Error("Git credentials not configured.");
    }
    if (
      allOutput.includes("Please tell me who you are") ||
      allOutput.includes("author identity unknown")
    ) {
      throw new Error(
        "Git user not configured. Run:\ngit config user.name \"Your Name\"\ngit config user.email \"you@example.com\""
      );
    }

    throw new Error(`Git commit failed: ${allOutput}`);
  }
}

export function pushCommits(): boolean {
  try {
    execFileSync("git", ["push"], {
      encoding: "utf-8",
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

