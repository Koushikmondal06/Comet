#!/usr/bin/env node

import { program } from "./cli/program";

process.on("uncaughtException", (error) => {
  // Graceful exit when the user cancels an @inquirer prompt with Ctrl+C
  if (error instanceof Error && error.name === "ExitPromptError") {
    console.log("\nCancelled.");
    process.exit(0);
  }
  throw error;
});

program.parse(process.argv);
