import type { z } from "zod";

export type StructuredGenerationRequest<T> = {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
};

export type AiProvider = {
  generateStructured<T>(
    request: StructuredGenerationRequest<T>,
  ): Promise<unknown>;
};
