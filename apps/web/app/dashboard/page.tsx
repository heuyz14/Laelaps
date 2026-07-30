import {
  Activity,
  Clock3,
  Footprints,
  Plus,
  Route,
  Target,
} from "lucide-react";
import Link from "next/link";

import { createRun } from "@/app/dashboard/actions";
import { AppShell, StatusMessage } from "@/components/app/app-shell";
import { RunForm } from "@/components/runs/run-form";
import { Button } from "@/components/ui/button";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { countActiveGoals, getGoals } from "@/lib/goals";
import { ensureUserProfile } from "@/lib/profiles";
import {
  formatDistance,
  formatDuration,
  formatPace,
  getAveragePaceSecondsPerKm,
  getRecentRuns,
  getRunDashboardStats,
  getShoeName,
} from "@/lib/runs";
import { getActiveShoes, getShoes } from "@/lib/shoes";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{
    run_error?: string | string[];
    run_notice?: string | string[];
  }>;
}) {
  const { supabase, user } = await getAuthenticatedContext();
  const [profile, recentRuns, shoes, goals] = await Promise.all([
    ensureUserProfile(supabase, user),
    getRecentRuns(supabase),
    getShoes(supabase),
    getGoals(supabase),
  ]);
  const activeShoes = getActiveShoes(shoes);
  const stats = getRunDashboardStats(recentRuns);
  const params = searchParams ? await searchParams : {};
  const runNotice = firstParam(params.run_notice);
  const runError = firstParam(params.run_error);

  return (
    <AppShell title="Dashboard" activeNav="dashboard">
      <div className="grid gap-5 lg:gap-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal text-foreground md:text-[1.75rem] md:leading-9">
              Welcome{profile.display_name ? `, ${profile.display_name}` : ""}
            </h2>
            <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground">
              Log runs manually, track shoes and goals, and keep the dashboard
              grounded in deterministic training data.
            </p>
          </div>
          <Button
            asChild
            className="h-10 rounded-lg px-5 text-sm shadow-[0_12px_24px_rgba(252,76,2,0.16)] md:inline-flex"
          >
            <a href="#add-run">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add run
            </a>
          </Button>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Activity className="h-4 w-4" aria-hidden="true" />}
            title="Recent runs"
            value={String(stats.runCount)}
            description="Latest saved runs."
          />
          <MetricCard
            icon={<Route className="h-5 w-5" aria-hidden="true" />}
            title="Distance"
            value={formatDistance(stats.distanceMeters, profile.preferred_unit)}
            description="From recent runs."
          />
          <MetricCard
            icon={<Clock3 className="h-5 w-5" aria-hidden="true" />}
            title="Training time"
            value={formatDuration(stats.durationSeconds)}
            description="Logged duration."
          />
          <MetricCard
            icon={<Target className="h-5 w-5" aria-hidden="true" />}
            title="Active goals"
            value={String(countActiveGoals(goals))}
            description={`${activeShoes.length} active shoe${activeShoes.length === 1 ? "" : "s"}.`}
          />
        </section>

        <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(25rem,0.42fr)_minmax(0,0.58fr)] xl:gap-5">
          <section
            id="add-run"
            className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm sm:p-5"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Add a run</h2>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Save the workout details you need for the Phase 2 history and
                  dashboard.
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Plus className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>

            <div className="mb-4 grid gap-3">
              {runNotice === "created" ? (
                <StatusMessage kind="notice">Run saved.</StatusMessage>
              ) : null}
              {runError ? (
                <StatusMessage kind="error">
                  {runError === "invalid_run"
                    ? "Check your run details and try again."
                    : "Unable to save this run. Try again."}
                </StatusMessage>
              ) : null}
            </div>

            <RunForm
              action={createRun}
              submitLabel="Save run"
              preferredUnit={profile.preferred_unit}
              shoes={shoes}
            />
          </section>

          <section className="flex min-h-[27rem] flex-col rounded-xl border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Recent run history</h2>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Latest runs with pace, shoe, and effort details.
                </p>
              </div>
              <Footprints className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>

            {recentRuns.length > 0 ? (
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="hidden grid-cols-[1fr_0.8fr_0.8fr_0.7fr_1fr_0.6fr] gap-4 border-b pb-3 text-xs font-medium uppercase text-muted-foreground lg:grid">
                  <span>Date</span>
                  <span>Distance</span>
                  <span>Duration</span>
                  <span>Pace</span>
                  <span>Shoe</span>
                  <span>Effort</span>
                </div>
                <ul className="divide-y" aria-label="Recent runs">
                  {recentRuns.map((run) => {
                    const shoeName = getShoeName(run);
                    const pace = formatPace(
                      getAveragePaceSecondsPerKm(run),
                      profile.preferred_unit,
                    );

                    return (
                      <li key={run.id}>
                        <Link
                          href={`/runs/${run.id}`}
                          className="grid gap-3 py-4 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:grid-cols-[1fr_0.8fr_0.8fr_0.7fr_1fr_0.6fr] lg:gap-4"
                        >
                          <span className="font-medium">{run.run_date}</span>
                          <span>
                            {formatDistance(
                              run.distance_meters,
                              profile.preferred_unit,
                            )}
                          </span>
                          <span>{formatDuration(run.duration_seconds)}</span>
                          <span>{pace}</span>
                          <span className="text-muted-foreground">
                            {shoeName ?? "No shoe"}
                          </span>
                          <span className="text-muted-foreground">
                            {run.effort ? `${run.effort}/10` : "N/A"}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <EmptyState />
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function MetricCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <article className="min-h-[7.5rem] rounded-xl border bg-card p-4 text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md lg:p-5">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold leading-none tracking-normal">
        {value}
      </p>
      <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[25rem] flex-1 items-center justify-center rounded-xl border border-dashed bg-background/70 p-8 text-center">
      <div>
        <Footprints
          className="mx-auto h-10 w-10 text-primary"
          aria-hidden="true"
        />
        <p className="mt-3 text-base font-semibold">No runs logged yet</p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Save your first run to start building a private training history and
          dashboard summaries.
        </p>
      </div>
    </div>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
