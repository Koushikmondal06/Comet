import chalk from "chalk";
import { EMOJIS } from "../constants/emojis";

export const logger = {
  info: (message: string) => {
    console.log(chalk.cyan(`${EMOJIS.arrow} `) + message);
  },

  success: (message: string) => {
    console.log(chalk.green(`${EMOJIS.check} `) + message);
  },

  error: (message: string) => {
    console.error(chalk.red(`${EMOJIS.cross} `) + message);
  },

  warn: (message: string) => {
    console.log(chalk.yellow(`⚠ `) + message);
  },

  step: (message: string) => {
    console.log(chalk.gray(`  ${EMOJIS.arrow} `) + message);
  },

  dim: (message: string) => {
    console.log(chalk.gray(message));
  },

  bold: (message: string) => {
    console.log(chalk.bold(message));
  },

  blank: () => {
    console.log("");
  },
};
