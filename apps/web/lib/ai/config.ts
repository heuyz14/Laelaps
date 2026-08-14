import { z } from "zod";

const defaultEndpoint = "https://api.openai.com/v1/chat/completions";
const defaultModel = "gpt-4o-mini";

const aiProviderConfigSchema = z.object({
  apiKey: z.string().min(1),
  endpoint: z.string().url(),
  model: z.string().min(1),
});

export type AiProviderConfig = z.infer<typeof aiProviderConfigSchema>;

export function getAiProviderConfig(
  env: Record<string, string | undefined> = process.env,
): AiProviderConfig | null {
  const endpoint = env.AI_API_ENDPOINT?.trim() || defaultEndpoint;
  const model = env.AI_MODEL?.trim() || defaultModel;
  const result = aiProviderConfigSchema.safeParse({
    apiKey: env.AI_API_KEY,
    endpoint,
    model,
  });

  return result.success ? result.data : null;
}
