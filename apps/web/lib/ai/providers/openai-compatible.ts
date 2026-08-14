import type {
  AiProvider,
  StructuredGenerationRequest,
} from "@/lib/ai/provider";

type FetchResponse = {
  ok: boolean;
  json(): Promise<unknown>;
};

type FetchImplementation = (
  input: string,
  init: {
    method: "POST";
    headers: Record<string, string>;
    body: string;
  },
) => Promise<FetchResponse>;

export type OpenAiCompatibleProviderOptions = {
  apiKey: string;
  endpoint: string;
  model: string;
  fetchImpl?: FetchImplementation;
};

export function createOpenAiCompatibleProvider(
  options: OpenAiCompatibleProviderOptions,
): AiProvider {
  const fetchImpl = options.fetchImpl ?? (fetch as FetchImplementation);

  return {
    async generateStructured<T>(
      request: StructuredGenerationRequest<T>,
    ): Promise<unknown> {
      let response: FetchResponse;

      try {
        response = await fetchImpl(options.endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${options.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: options.model,
            messages: [
              { role: "system", content: request.systemPrompt },
              { role: "user", content: request.userPrompt },
            ],
            response_format: { type: "json_object" },
          }),
        });
      } catch {
        throw new Error("AI provider request failed.");
      }

      if (!response.ok) {
        throw new Error("AI provider request failed.");
      }

      try {
        const payload = await response.json();
        const content = getMessageContent(payload);
        return JSON.parse(extractJsonContent(content)) as unknown;
      } catch {
        throw new Error("AI provider returned invalid structured output.");
      }
    },
  };
}

function getMessageContent(payload: unknown) {
  if (!isRecord(payload)) {
    throw new Error("Missing provider payload.");
  }

  const choices = payload.choices;
  if (!Array.isArray(choices) || !isRecord(choices[0])) {
    throw new Error("Missing provider choices.");
  }

  const message = choices[0].message;
  if (!isRecord(message) || typeof message.content !== "string") {
    throw new Error("Missing provider message content.");
  }

  return message.content;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractJsonContent(content: string) {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fencedMatch?.[1]?.trim() ?? trimmed;
}
