import { Config, AIProvider } from "../types/config";
import { DEFAULT_CONFIG } from "./defaults";
import { readJsonFile, writeJsonFile, getConfigDir } from "../utils/files";
import * as path from "path";

const CONFIG_FILE = "config.json";

function getConfigPath(): string {
  return path.join(getConfigDir(), CONFIG_FILE);
}

export function loadConfig(): Config {
  const saved = readJsonFile<Config>(getConfigPath());
  if (saved) {
    return { ...DEFAULT_CONFIG, ...saved };
  }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(config: Config): void {
  writeJsonFile(getConfigPath(), config);
}

export function updateConfig(updates: Partial<Config>): Config {
  const current = loadConfig();
  const updated = { ...current, ...updates };
  saveConfig(updated);
  return updated;
}

export function getConfigValue<K extends keyof Config>(key: K): Config[K] {
  const config = loadConfig();
  return config[key];
}

export function setConfigValue<K extends keyof Config>(
  key: K,
  value: Config[K]
): void {
  updateConfig({ [key]: value } as Partial<Config>);
}

export function resetConfig(): Config {
  saveConfig({ ...DEFAULT_CONFIG });
  return loadConfig();
}

export function getEffectiveProvider(): AIProvider {
  const config = loadConfig();
  const envProvider = process.env.AI_PROVIDER as AIProvider | undefined;
  return envProvider || config.provider;
}
