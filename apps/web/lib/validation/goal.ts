import { z } from "zod";

const goalStatusSchema = z.enum(["active", "completed", "paused", "archived"]);

export const goalFormSchema = z.object({
  type: z
    .string()
    .trim()
    .min(1, "Goal type is required.")
    .max(120, "Goal type must be 120 characters or fewer."),
  targetValue: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? Number(value) : null))
    .pipe(z.number().positive().max(1000000).nullable()),
  targetDate: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null))
    .pipe(
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .nullable(),
    ),
  status: goalStatusSchema.default("active"),
});

export type GoalFormValues = z.infer<typeof goalFormSchema>;

export function parseGoalFormData(formData: FormData): GoalFormValues {
  return goalFormSchema.parse({
    type: formData.get("type"),
    targetValue: formData.get("targetValue"),
    targetDate: formData.get("targetDate"),
    status: formData.get("status") || "active",
  });
}
