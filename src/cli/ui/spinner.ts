import chalk from "chalk";
import { EMOJIS } from "../../constants/emojis";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const INTERVAL_MS = 80;

// Minimal ora replacement: animated only on a TTY, plain lines otherwise
class Spinner {
  private timer: NodeJS.Timeout | null = null;
  private frameIndex = 0;

  constructor(private text: string) {}

  start(): void {
    if (!process.stderr.isTTY) return;
    process.stderr.write("\x1B[?25l");
    this.timer = setInterval(() => {
      const frame = chalk.cyan(FRAMES[this.frameIndex]);
      this.frameIndex = (this.frameIndex + 1) % FRAMES.length;
      process.stderr.write(`\r${frame} ${chalk.cyan(this.text)}`);
    }, INTERVAL_MS);
  }

  private stop(finalLine: string): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      process.stderr.write("\r\x1B[2K\x1B[?25h");
    }
    console.log(finalLine);
  }

  succeed(): void {
    this.stop(chalk.green(`${EMOJIS.check} ${this.text}`));
  }

  fail(): void {
    this.stop(chalk.red(`${EMOJIS.cross} ${this.text}`));
  }
}

export async function withSpinner<T>(
  text: string,
  fn: () => Promise<T>
): Promise<T> {
  const spinner = new Spinner(text);
  spinner.start();
  try {
    const result = await fn();
    spinner.succeed();
    return result;
  } catch (error) {
    spinner.fail();
    throw error;
  }
}
