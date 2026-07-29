import { z } from "zod";

export const preferredUnitSchema = z.enum(["metric", "imperial"]);

export const profileSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().trim().min(1).max(120).nullable(),
  preferred_unit: preferredUnitSchema.default("metric"),
});

export type Profile = z.infer<typeof profileSchema>;
