import { z } from "zod";

const openRouterEndpoint = "https://openrouter.ai/api/v1/chat/completions";
const openRouterFreeModel = "openrouter/free";

const aiProviderConfigSchema = z.object({
  apiKey: z.string().min(1),
  endpoint: z.string().url(),
  model: z.string().min(1),
});

export type AiProviderConfig = z.infer<typeof aiProviderConfigSchema>;

export function getAiProviderConfig(
  env: Record<string, string | undefined> = process.env,
): AiProviderConfig | null {
  const openRouterApiKey = env.OPENROUTER_API_KEY?.trim();
  if (!openRouterApiKey) {
    return null;
  }

  const model = env.OPENROUTER_MODEL?.trim() || openRouterFreeModel;
  if (!isFreeOpenRouterModel(model)) {
    return null;
  }

  const result = aiProviderConfigSchema.safeParse({
    apiKey: openRouterApiKey,
    endpoint: openRouterEndpoint,
    model,
  });

  return result.success ? result.data : null;
}

function isFreeOpenRouterModel(model: string) {
  return model === openRouterFreeModel || model.endsWith(":free");
}
