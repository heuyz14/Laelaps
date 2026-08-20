"use client";

import { useFormStatus } from "react-dom";

type DistanceUnit = "km" | "mi";

export function DistanceUnitForm({
  action,
  preferredUnit,
}: {
  action: (formData: FormData) => void | Promise<void>;
  preferredUnit: DistanceUnit;
}) {
  return (
    <form action={action} className="grid gap-4">
      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium">Distance unit</legend>
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
          <UnitOption
            value="km"
            label="Kilometers (km)"
            description="Use kilometers for dashboard and AI training answers."
            checked={preferredUnit === "km"}
          />
          <UnitOption
            value="mi"
            label="Miles (mi)"
            description="Use miles for dashboard and AI training answers."
            checked={preferredUnit === "mi"}
          />
        </div>
      </fieldset>
      <SaveButton />
    </form>
  );
}

function UnitOption({
  value,
  label,
  description,
  checked,
}: {
  value: DistanceUnit;
  label: string;
  description: string;
  checked: boolean;
}) {
  return (
    <label className="grid cursor-pointer gap-1 rounded-lg border bg-background p-4 transition has-[:checked]:border-primary has-[:checked]:bg-primary/5">
      <span className="flex items-center gap-2 font-medium">
        <input
          type="radio"
          name="preferredUnit"
          value={value}
          defaultChecked={checked}
          className="h-4 w-4 accent-primary"
        />
        {label}
      </span>
      <span className="pl-6 text-sm leading-5 text-muted-foreground">
        {description}
      </span>
    </label>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 w-fit items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save preference"}
    </button>
  );
}
