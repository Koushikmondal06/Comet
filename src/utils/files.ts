import * as fs from "fs";
import * as path from "path";

export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function readJsonFile<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export function writeJsonFile<T>(filePath: string, data: T): void {
  ensureDirectoryExists(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function appendJsonFile<T>(filePath: string, data: T): void {
  const existing = readJsonFile<T[]>(filePath);
  const array = existing || [];
  array.push(data);
  writeJsonFile(filePath, array);
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function readFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

export function getConfigDir(): string {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  return path.join(home, ".aicommit");
}
