import { describe, it, expect } from "vitest";
import { resolveProviderOption } from "../src/ai/provider";
import { PROVIDERS, isProvider } from "../src/constants/providers";
import { getModelsForProvider } from "../src/constants/models";

describe("resolveProviderOption", () => {
  it("accepts every registered provider", () => {
    for (const name of Object.keys(PROVIDERS)) {
      expect(resolveProviderOption(name)).toBe(name);
    }
  });

  it("rejects unknown providers", () => {
    expect(() => resolveProviderOption("chatgpt")).toThrow(/Invalid provider/);
  });

  it("returns undefined for empty input", () => {
    expect(resolveProviderOption(undefined)).toBeUndefined();
  });
});

describe("provider registry", () => {
  it("openai-compatible providers have a base URL", () => {
    expect(PROVIDERS.openai.baseUrl).toContain("api.openai.com");
    expect(PROVIDERS.openrouter.baseUrl).toContain("openrouter.ai");
    expect(PROVIDERS.nim.baseUrl).toContain("integrate.api.nvidia.com");
  });

  it("custom has no fixed base URL and no default model", () => {
    expect(PROVIDERS.custom.baseUrl).toBeUndefined();
    expect(PROVIDERS.custom.defaultModel).toBe("");
  });

  it("isProvider guards correctly", () => {
    expect(isProvider("claude")).toBe(true);
    expect(isProvider("nim")).toBe(true);
    expect(isProvider("bard")).toBe(false);
  });
});

describe("getModelsForProvider", () => {
  it("returns static lists for known providers and [] for custom", () => {
    expect(getModelsForProvider("claude").length).toBeGreaterThan(0);
    expect(getModelsForProvider("openrouter").length).toBeGreaterThan(0);
    expect(getModelsForProvider("nim").length).toBeGreaterThan(0);
    expect(getModelsForProvider("custom")).toEqual([]);
  });
});
