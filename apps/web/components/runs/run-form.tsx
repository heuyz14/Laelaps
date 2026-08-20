import { Button } from "@/components/ui/button";
import { Field, fieldClassName } from "@/components/app/forms";
import { splitDuration, type DashboardRun } from "@/lib/runs";
import type { Shoe } from "@/lib/shoes";

export function RunForm({
  action,
  submitLabel,
  preferredUnit,
  shoes,
  run,
}: {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  preferredUnit: "km" | "mi";
  shoes: Shoe[];
  run?: DashboardRun;
}) {
  const duration = run ? splitDuration(run.duration_seconds) : null;

  return (
    <form action={action} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Date" htmlFor="runDate">
          <input
            id="runDate"
            name="runDate"
            type="date"
            required
            defaultValue={run?.run_date}
            className={fieldClassName}
          />
        </Field>
        <Field label="Distance" htmlFor="distance">
          <div className="grid grid-cols-[minmax(0,1fr)_8rem] gap-2">
            <input
              id="distance"
              name="distance"
              type="number"
              min="0.01"
              max="200"
              step="0.01"
              required
              placeholder="5.00"
              defaultValue={
                run
                  ? preferredUnit === "km"
                    ? (run.distance_meters / 1000).toFixed(2)
                    : (run.distance_meters / 1609.344).toFixed(2)
                  : undefined
              }
              className={fieldClassName}
            />
            <select
              name="distanceUnit"
              aria-label="Distance unit"
              defaultValue={preferredUnit === "km" ? "kilometers" : "miles"}
              className={fieldClassName}
            >
              <option value="kilometers">km</option>
              <option value="miles">mi</option>
            </select>
          </div>
        </Field>
      </div>

      <Field label="Shoe" htmlFor="shoeId">
        <select
          id="shoeId"
          name="shoeId"
          defaultValue={run?.shoe_id ?? ""}
          className={fieldClassName}
        >
          <option value="">No shoe selected</option>
          {shoes.map((shoe) => (
            <option key={shoe.id} value={shoe.id}>
              {shoe.name}
              {shoe.retired_at ? " (retired)" : ""}
            </option>
          ))}
        </select>
      </Field>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Duration</legend>
        <div className="grid grid-cols-3 gap-2">
          <input
            name="durationHours"
            type="number"
            min="0"
            max="48"
            placeholder="hr"
            aria-label="Duration hours"
            defaultValue={duration?.hours}
            className={fieldClassName}
          />
          <input
            name="durationMinutes"
            type="number"
            min="0"
            max="59"
            placeholder="min"
            aria-label="Duration minutes"
            defaultValue={duration?.minutes}
            className={fieldClassName}
          />
          <input
            name="durationSeconds"
            type="number"
            min="0"
            max="59"
            placeholder="sec"
            aria-label="Duration seconds"
            defaultValue={duration?.seconds}
            className={fieldClassName}
          />
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Avg HR" htmlFor="avgHeartRate">
          <input
            id="avgHeartRate"
            name="avgHeartRate"
            type="number"
            min="30"
            max="240"
            placeholder="150"
            defaultValue={run?.avg_heart_rate ?? undefined}
            className={fieldClassName}
          />
        </Field>
        <Field label="Max HR" htmlFor="maxHeartRate">
          <input
            id="maxHeartRate"
            name="maxHeartRate"
            type="number"
            min="30"
            max="240"
            placeholder="172"
            defaultValue={run?.max_heart_rate ?? undefined}
            className={fieldClassName}
          />
        </Field>
        <Field label="Effort" htmlFor="effort">
          <input
            id="effort"
            name="effort"
            type="number"
            min="1"
            max="10"
            placeholder="6"
            defaultValue={run?.effort ?? undefined}
            className={fieldClassName}
          />
        </Field>
      </div>

      <Field label="Notes" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          maxLength={1000}
          rows={3}
          placeholder="Easy aerobic run, steady breathing."
          defaultValue={run?.notes ?? undefined}
          className={`${fieldClassName} min-h-20 py-2.5`}
        />
      </Field>

      <Button
        type="submit"
        className="h-10 w-full rounded-lg shadow-sm transition hover:shadow-md"
      >
        {submitLabel}
      </Button>
    </form>
  );
}
