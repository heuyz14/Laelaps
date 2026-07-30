import { Target, Trash2 } from "lucide-react";

import { createGoal, deleteGoal, updateGoal } from "@/app/dashboard/actions";
import { AppShell, StatusMessage } from "@/components/app/app-shell";
import { Field, fieldClassName } from "@/components/app/forms";
import { Button } from "@/components/ui/button";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { getGoals } from "@/lib/goals";

const statuses = ["active", "completed", "paused", "archived"] as const;

export default async function GoalsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    goal_error?: string | string[];
    goal_notice?: string | string[];
  }>;
}) {
  const { supabase } = await getAuthenticatedContext();
  const goals = await getGoals(supabase);
  const params = searchParams ? await searchParams : {};
  const goalNotice = firstParam(params.goal_notice);
  const goalError = firstParam(params.goal_error);

  return (
    <AppShell title="Goals" activeNav="goals">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border bg-card p-6 text-card-foreground">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Add goal</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep goals simple for Phase 2: type, target, date, status.
              </p>
            </div>
            <Target className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>

          <div className="mb-4 grid gap-3">
            {goalNotice ? (
              <StatusMessage kind="notice">
                {goalNotice === "created"
                  ? "Goal saved."
                  : goalNotice === "updated"
                    ? "Goal updated."
                    : "Goal deleted."}
              </StatusMessage>
            ) : null}
            {goalError ? (
              <StatusMessage kind="error">
                {goalError === "invalid_goal"
                  ? "Check your goal details and try again."
                  : "Unable to save this goal."}
              </StatusMessage>
            ) : null}
          </div>

          <GoalFields action={createGoal} submitLabel="Save goal" />
        </section>

        <section className="rounded-lg border bg-card p-6 text-card-foreground">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Goal list</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Active goals appear on the dashboard summary.
            </p>
          </div>

          {goals.length > 0 ? (
            <ul className="divide-y" aria-label="Goals">
              {goals.map((goal) => {
                const updateGoalWithId = updateGoal.bind(null, goal.id);
                const deleteGoalWithId = deleteGoal.bind(null, goal.id);

                return (
                  <li key={goal.id} className="grid gap-3 py-4">
                    <GoalFields
                      action={updateGoalWithId}
                      submitLabel="Update"
                      goal={goal}
                    />
                    <form action={deleteGoalWithId}>
                      <Button type="submit" variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Delete
                      </Button>
                    </form>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed bg-background/70 p-8 text-center">
              <Target
                className="mx-auto h-8 w-8 text-primary"
                aria-hidden="true"
              />
              <p className="mt-3 font-medium">No goals yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add one focused target to start tracking progress.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function GoalFields({
  action,
  submitLabel,
  goal,
}: {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  goal?: {
    type: string;
    target_value: number | null;
    target_date: string | null;
    status: (typeof statuses)[number];
  };
}) {
  return (
    <form action={action} className="grid gap-3">
      <Field label="Goal type" htmlFor={goal ? `${goal.type}-type` : "type"}>
        <input
          id={goal ? `${goal.type}-type` : "type"}
          name="type"
          required
          maxLength={120}
          placeholder="Weekly distance"
          defaultValue={goal?.type}
          className={fieldClassName}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Target" htmlFor={goal ? `${goal.type}-target` : "target"}>
          <input
            id={goal ? `${goal.type}-target` : "target"}
            name="targetValue"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="40"
            defaultValue={goal?.target_value ?? undefined}
            className={fieldClassName}
          />
        </Field>
        <Field label="Date" htmlFor={goal ? `${goal.type}-date` : "targetDate"}>
          <input
            id={goal ? `${goal.type}-date` : "targetDate"}
            name="targetDate"
            type="date"
            defaultValue={goal?.target_date ?? undefined}
            className={fieldClassName}
          />
        </Field>
        <Field label="Status" htmlFor={goal ? `${goal.type}-status` : "status"}>
          <select
            id={goal ? `${goal.type}-status` : "status"}
            name="status"
            defaultValue={goal?.status ?? "active"}
            className={fieldClassName}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Button type="submit" variant={goal ? "outline" : "default"}>
        {submitLabel}
      </Button>
    </form>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
