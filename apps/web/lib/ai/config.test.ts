import { describe, expect, it } from "vitest";

import { getAiProviderConfig } from "@/lib/ai/config";

describe("getAiProviderConfig", () => {
  it("returns server-only provider configuration", () => {
    expect(
      getAiProviderConfig({
        AI_API_KEY: "server-secret",
        AI_API_ENDPOINT: "https://api.example.test/v1/chat/completions",
        AI_MODEL: "test-model",
      }),
    ).toEqual({
      apiKey: "server-secret",
      endpoint: "https://api.example.test/v1/chat/completions",
      model: "test-model",
    });
  });

  it("defaults optional endpoint and model settings", () => {
    expect(
      getAiProviderConfig({
        AI_API_KEY: "server-secret",
        AI_API_ENDPOINT: "",
        AI_MODEL: "",
      }),
    ).toEqual({
      apiKey: "server-secret",
      endpoint: "https://api.openai.com/v1/chat/completions",
      model: "gpt-4o-mini",
    });
  });

  it("returns null when any required setting is missing or invalid", () => {
    expect(
      getAiProviderConfig({
        AI_API_KEY: "server-secret",
        AI_API_ENDPOINT: "not-a-url",
      }),
    ).toBeNull();
  });
});
