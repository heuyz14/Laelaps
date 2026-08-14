import { describe, expect, it } from "vitest";

import { getAiProviderConfig } from "@/lib/ai/config";

describe("getAiProviderConfig", () => {
  it("returns server-only OpenRouter free-router configuration", () => {
    expect(
      getAiProviderConfig({
        OPENROUTER_API_KEY: "server-secret",
        OPENROUTER_MODEL: "openrouter/free",
      }),
    ).toEqual({
      apiKey: "server-secret",
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      model: "openrouter/free",
    });
  });

  it("defaults to the OpenRouter free model router", () => {
    expect(
      getAiProviderConfig({
        OPENROUTER_API_KEY: "server-secret",
        OPENROUTER_MODEL: "",
      }),
    ).toEqual({
      apiKey: "server-secret",
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      model: "openrouter/free",
    });
  });

  it("allows specific OpenRouter free model variants", () => {
    const config = getAiProviderConfig({
      OPENROUTER_API_KEY: "server-secret",
      OPENROUTER_MODEL: "meta-llama/llama-3.2-3b-instruct:free",
    });

    expect(config?.model).toBe("meta-llama/llama-3.2-3b-instruct:free");
  });

  it("returns null when the OpenRouter key is missing", () => {
    expect(
      getAiProviderConfig({ OPENROUTER_MODEL: "openrouter/free" }),
    ).toBeNull();
  });

  it("rejects paid or auto-routed OpenRouter models", () => {
    expect(
      getAiProviderConfig({
        OPENROUTER_API_KEY: "server-secret",
        OPENROUTER_MODEL: "openrouter/auto",
      }),
    ).toBeNull();
    expect(
      getAiProviderConfig({
        OPENROUTER_API_KEY: "server-secret",
        OPENROUTER_MODEL: "anthropic/claude-sonnet-4",
      }),
    ).toBeNull();
  });
});
