import { z } from "zod";

export const shoeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Shoe name is required.")
    .max(120, "Shoe name must be 120 characters or fewer."),
  retired: z.boolean().default(false),
});

export type ShoeFormValues = z.infer<typeof shoeFormSchema>;

export function parseShoeFormData(formData: FormData): ShoeFormValues {
  return shoeFormSchema.parse({
    name: formData.get("name"),
    retired: formData.get("retired") === "on",
  });
}
