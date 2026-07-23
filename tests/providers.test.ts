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
    expect(getModelsForProvider("groq").length).toBeGreaterThan(0);
    expect(getModelsForProvider("nim").length).toBeGreaterThan(0);
    expect(getModelsForProvider("custom")).toEqual([]);
  });
});

import { vi, afterEach } from "vitest";
import { detectCustomEndpoint } from "../src/ai/detectCustom";

describe("detectCustomEndpoint", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("classifies Anthropic-style endpoints by display_name", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: [{ id: "claude-fable-5", display_name: "Claude Fable 5" }],
      }),
    })));
    const detected = await detectCustomEndpoint("https://proxy.example", "k");
    expect(detected?.api).toBe("anthropic");
    expect(detected?.models[0].value).toBe("claude-fable-5");
  });

  it("classifies OpenAI-style endpoints and filters non-chat models", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: [{ id: "llama3" }, { id: "text-embedding-3-small" }],
      }),
    })));
    const detected = await detectCustomEndpoint("http://localhost:11434/v1", "");
    expect(detected?.api).toBe("openai");
    expect(detected?.models.map((m) => m.value)).toEqual(["llama3"]);
  });

  it("classifies by supported_endpoint_types when display_name is absent", async () => {
    // Shape returned by cc.freemodel.dev — Anthropic models, no display_name
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: [
          { id: "claude-opus-4-8", owned_by: "anthropic", supported_endpoint_types: ["anthropic"] },
        ],
      }),
    })));
    const detected = await detectCustomEndpoint("https://cc.freemodel.dev", "k");
    expect(detected?.api).toBe("anthropic");
    expect(detected?.models[0].value).toBe("claude-opus-4-8");
  });

  it("prefers openai when an endpoint advertises both styles", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: [{ id: "gpt-5.5", supported_endpoint_types: ["openai", "anthropic"] }],
      }),
    })));
    const detected = await detectCustomEndpoint("https://freemodel.dev", "");
    expect(detected?.api).toBe("openai");
  });

  it("returns null when nothing responds", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })));
    const detected = await detectCustomEndpoint("https://nope.example", "");
    expect(detected).toBeNull();
  });
});
