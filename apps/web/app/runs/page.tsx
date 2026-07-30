import { BarChart3, Search } from "lucide-react";
import Link from "next/link";

import { AppShell, StatusMessage } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { ensureUserProfile } from "@/lib/profiles";
import {
  formatDistance,
  formatDuration,
  formatPace,
  getAveragePaceSecondsPerKm,
  getRuns,
  getShoeName,
} from "@/lib/runs";

type SortOption = "newest" | "oldest" | "distance_desc" | "distance_asc";

export default async function RunsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string | string[];
    sort?: string | string[];
    run_notice?: string | string[];
  }>;
}) {
  const { supabase, user } = await getAuthenticatedContext();
  const params = searchParams ? await searchParams : {};
  const query = firstParam(params.q)?.trim() ?? "";
  const sort = normalizeSort(firstParam(params.sort));
  const [profile, runs] = await Promise.all([
    ensureUserProfile(supabase, user),
    getRuns(supabase, { query, sort }),
  ]);
  const runNotice = firstParam(params.run_notice);

  return (
    <AppShell title="Run history" activeNav="runs">
      <div className="grid gap-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Runs</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Review logged runs, filter by notes, sort by date or distance, and
              drill into details.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard">Add run</Link>
          </Button>
        </section>

        {runNotice === "deleted" ? (
          <StatusMessage kind="notice">Run deleted.</StatusMessage>
        ) : null}

        <form
          className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto]"
          action="/runs"
        >
          <label className="relative">
            <span className="sr-only">Search run notes</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search notes"
              className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </label>
          <select
            name="sort"
            defaultValue={sort}
            aria-label="Sort runs"
            className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="distance_desc">Distance high</option>
            <option value="distance_asc">Distance low</option>
          </select>
          <Button type="submit" variant="outline" className="h-11 rounded-xl">
            Apply
          </Button>
        </form>

        <section className="rounded-lg border bg-card text-card-foreground">
          {runs.length > 0 ? (
            <ul className="divide-y" aria-label="Run history">
              {runs.map((run) => {
                const pace = formatPace(
                  getAveragePaceSecondsPerKm(run),
                  profile.preferred_unit,
                );
                const shoeName = getShoeName(run);

                return (
                  <li
                    key={run.id}
                    className="grid gap-4 p-5 lg:grid-cols-[1.4fr_1fr_auto]"
                  >
                    <div>
                      <Link
                        href={`/runs/${run.id}`}
                        className="text-lg font-semibold transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {formatDistance(
                          run.distance_meters,
                          profile.preferred_unit,
                        )}{" "}
                        run
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {run.run_date}
                        {shoeName ? ` · ${shoeName}` : ""}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <Stat
                        label="Duration"
                        value={formatDuration(run.duration_seconds)}
                      />
                      <Stat label="Pace" value={pace} />
                      <Stat
                        label="Effort"
                        value={run.effort ? `${run.effort}/10` : "N/A"}
                      />
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/runs/${run.id}`}>Open</Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-10 text-center">
              <BarChart3
                className="mx-auto h-8 w-8 text-primary"
                aria-hidden="true"
              />
              <p className="mt-3 font-medium">No runs found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a run or clear your filters.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeSort(value: string | undefined): SortOption {
  if (
    value === "oldest" ||
    value === "distance_desc" ||
    value === "distance_asc"
  ) {
    return value;
  }

  return "newest";
}
