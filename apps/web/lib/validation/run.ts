import { z } from "zod";

const distanceUnitSchema = z.enum(["kilometers", "miles"]);

const optionalIntegerField = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? Number(value) : null));

export const runFormSchema = z
  .object({
    shoeId: z
      .string()
      .trim()
      .uuid()
      .nullable()
      .optional()
      .transform((value) => value ?? null),
    runDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid run date."),
    distance: z
      .string()
      .trim()
      .min(1, "Distance is required.")
      .transform((value) => Number(value))
      .pipe(
        z
          .number()
          .positive("Distance must be greater than zero.")
          .max(200, "Distance must be 200 or less."),
      ),
    distanceUnit: distanceUnitSchema,
    durationHours: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? Number(value) : 0))
      .pipe(z.number().int().min(0).max(48)),
    durationMinutes: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? Number(value) : 0))
      .pipe(z.number().int().min(0).max(59)),
    durationSeconds: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? Number(value) : 0))
      .pipe(z.number().int().min(0).max(59)),
    avgHeartRate: optionalIntegerField.pipe(
      z.number().int().min(30).max(240).nullable(),
    ),
    maxHeartRate: optionalIntegerField.pipe(
      z.number().int().min(30).max(240).nullable(),
    ),
    effort: optionalIntegerField.pipe(
      z.number().int().min(1).max(10).nullable(),
    ),
    notes: z
      .string()
      .trim()
      .max(1000, "Notes must be 1000 characters or fewer.")
      .optional()
      .transform((value) => (value ? value : null)),
  })
  .superRefine((value, context) => {
    if (
      value.avgHeartRate !== null &&
      value.maxHeartRate !== null &&
      value.avgHeartRate > value.maxHeartRate
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["avgHeartRate"],
        message: "Average heart rate cannot exceed max heart rate.",
      });
    }

    const durationSeconds =
      value.durationHours * 3600 +
      value.durationMinutes * 60 +
      value.durationSeconds;

    if (durationSeconds <= 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["durationSeconds"],
        message: "Duration must be greater than zero.",
      });
    }
  });

export type RunFormInput = z.input<typeof runFormSchema>;

export type RunInsertValues = {
  shoe_id: string | null;
  run_date: string;
  distance_meters: number;
  duration_seconds: number;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  effort: number | null;
  notes: string | null;
};

export function parseRunFormData(formData: FormData): RunInsertValues {
  const parsed = runFormSchema.parse({
    shoeId: emptyStringToNull(formData.get("shoeId")),
    runDate: formData.get("runDate"),
    distance: formData.get("distance"),
    distanceUnit: formData.get("distanceUnit"),
    durationHours: formData.get("durationHours"),
    durationMinutes: formData.get("durationMinutes"),
    durationSeconds: formData.get("durationSeconds"),
    avgHeartRate: formData.get("avgHeartRate"),
    maxHeartRate: formData.get("maxHeartRate"),
    effort: formData.get("effort"),
    notes: formData.get("notes"),
  });

  return {
    shoe_id: parsed.shoeId,
    run_date: parsed.runDate,
    distance_meters: toMeters(parsed.distance, parsed.distanceUnit),
    duration_seconds:
      parsed.durationHours * 3600 +
      parsed.durationMinutes * 60 +
      parsed.durationSeconds,
    avg_heart_rate: parsed.avgHeartRate,
    max_heart_rate: parsed.maxHeartRate,
    effort: parsed.effort,
    notes: parsed.notes,
  };
}

function emptyStringToNull(value: FormDataEntryValue | null) {
  return value === "" ? null : value;
}

export function toMeters(
  distance: number,
  unit: z.infer<typeof distanceUnitSchema>,
) {
  return Math.round(distance * (unit === "kilometers" ? 1000 : 1609.344));
}
