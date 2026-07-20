import { confirm } from "@inquirer/prompts";

export async function confirmAction(
  message: string
): Promise<boolean> {
  return confirm({ message, default: true });
}
