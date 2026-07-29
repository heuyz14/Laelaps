import { z } from "zod";

export const emailPasswordSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
});

export type EmailPasswordInput = z.infer<typeof emailPasswordSchema>;
