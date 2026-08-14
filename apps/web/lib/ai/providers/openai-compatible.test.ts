import { describe, expect, it, vi } from "vitest";

import { createOpenAiCompatibleProvider } from "@/lib/ai/providers/openai-compatible";

const request = {
  systemPrompt: "Use only supplied facts.",
  userPrompt: '{"runCount":1}',
  schema: {} as never,
};

describe("createOpenAiCompatibleProvider", () => {
  it("sends structured generation requests and parses JSON content", async () => {
    const fetchImpl = vi.fn(async (_input: string, _init: { body: string }) => {
      void _input;
      void _init;
      return {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '{"summary":"Steady."}' } }],
        }),
      };
    });
    const provider = createOpenAiCompatibleProvider({
      apiKey: "test-secret",
      endpoint: "https://api.example.test/v1/chat/completions",
      model: "test-model",
      fetchImpl,
    });

    await expect(provider.generateStructured(request)).resolves.toEqual({
      summary: "Steady.",
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.test/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer test-secret",
          "Content-Type": "application/json",
        },
      }),
    );
    const requestInit = fetchImpl.mock.calls[0]?.[1];
    expect(requestInit).toBeDefined();
    expect(JSON.parse(requestInit?.body ?? "{}")).toMatchObject({
      model: "test-model",
      response_format: { type: "json_object" },
    });
  });

  it("normalizes transport and provider errors without exposing secrets", async () => {
    const fetchImpl = vi.fn(async (_input: string, _init: { body: string }) => {
      void _input;
      void _init;
      return {
        ok: false,
        json: async () => ({ error: "secret provider details" }),
      };
    });
    const provider = createOpenAiCompatibleProvider({
      apiKey: "test-secret",
      endpoint: "https://api.example.test/v1/chat/completions",
      model: "test-model",
      fetchImpl,
    });

    await expect(provider.generateStructured(request)).rejects.toThrow(
      "AI provider request failed",
    );
    await expect(provider.generateStructured(request)).rejects.not.toThrow(
      "test-secret",
    );
  });

  it("rejects malformed structured output", async () => {
    const provider = createOpenAiCompatibleProvider({
      apiKey: "test-secret",
      endpoint: "https://api.example.test/v1/chat/completions",
      model: "test-model",
      fetchImpl: vi.fn(async (_input: string, _init: { body: string }) => {
        void _input;
        void _init;
        return {
          ok: true,
          json: async () => ({
            choices: [{ message: { content: "not-json" } }],
          }),
        };
      }),
    });

    await expect(provider.generateStructured(request)).rejects.toThrow(
      "invalid structured output",
    );
  });
});
