import {
  Activity,
  Clock3,
  Flame,
  Footprints,
  Gauge,
  Route,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import { createRun } from "@/app/dashboard/actions";
import { AppShell, StatusMessage } from "@/components/app/app-shell";
import { DashboardTabs } from "@/components/app/dashboard-tabs";
import { AiInsightsPanel } from "@/components/app/ai-insights-panel";
import { AddRunDialog } from "@/components/runs/add-run-dialog";
import type { PeriodMileage, RecoverySignal } from "@/lib/analytics";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { countActiveGoals, getGoals } from "@/lib/goals";
import { ensureUserProfile } from "@/lib/profiles";
import {
  formatDistance,
  formatDuration,
  formatPace,
  getAveragePaceSecondsPerKm,
  getAnalyticsRuns,
  getRunAnalytics,
  getRuns,
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
  const [profile, historyRuns, analyticsRuns, shoes, goals] = await Promise.all(
    [
      ensureUserProfile(supabase, user),
      getRuns(supabase),
      getAnalyticsRuns(supabase),
      getShoes(supabase),
      getGoals(supabase),
    ],
  );
  const activeShoes = getActiveShoes(shoes);
  const analytics = getRunAnalytics(analyticsRuns);
  const latestWeek = getLatestPeriod(analytics.weeklyMileage);
  const latestMonth = getLatestPeriod(analytics.monthlyMileage);
  const activeGoals = countActiveGoals(goals);
  const params = searchParams ? await searchParams : {};
  const runNotice = firstParam(params.run_notice);
  const runError = firstParam(params.run_error);
  const overviewRuns = historyRuns.slice(0, 3);
  const effortZoneRows = [
    { label: "Easy", zone: analytics.effortZones.easy },
    { label: "Moderate", zone: analytics.effortZones.moderate },
    { label: "Hard", zone: analytics.effortZones.hard },
    { label: "Not set", zone: analytics.effortZones.unknown },
  ];

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
          <AddRunDialog
            action={createRun}
            preferredUnit={profile.preferred_unit}
            shoes={shoes}
          />
        </section>

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

        <DashboardTabs
          overview={
            <>
              <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  icon={<Activity className="h-4 w-4" aria-hidden="true" />}
                  title="Runs"
                  value={String(analytics.summary.runCount)}
                  description="Valid logged runs."
                />
                <MetricCard
                  icon={<Route className="h-5 w-5" aria-hidden="true" />}
                  title="Distance"
                  value={formatDistance(
                    analytics.summary.distanceMeters,
                    profile.preferred_unit,
                  )}
                  description="Total logged volume."
                />
                <MetricCard
                  icon={<Gauge className="h-5 w-5" aria-hidden="true" />}
                  title="Average pace"
                  value={formatOptionalPace(
                    analytics.summary.averagePaceSecondsPerKm,
                    profile.preferred_unit,
                  )}
                  description="Aggregate pace."
                />
                <MetricCard
                  icon={<Trophy className="h-5 w-5" aria-hidden="true" />}
                  title="Longest run"
                  value={formatDistance(
                    analytics.summary.longestRunMeters,
                    profile.preferred_unit,
                  )}
                  description="Personal distance record."
                />
              </section>
              <CurrentTrainingCard
                latestWeek={latestWeek}
                latestMonth={latestMonth}
                currentRunDayStreak={analytics.streaks.currentRunDayStreak}
                currentRunWeekStreak={analytics.streaks.currentRunWeekStreak}
                activeGoals={activeGoals}
                activeShoes={activeShoes.length}
                preferredUnit={profile.preferred_unit}
              />
              <RunHistorySection
                title="Recent runs"
                description="Latest saved runs."
                runs={overviewRuns}
                preferredUnit={profile.preferred_unit}
                compact
              />
            </>
          }
          training={
            <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="grid gap-4">
                <CurrentTrainingCard
                  latestWeek={latestWeek}
                  latestMonth={latestMonth}
                  currentRunDayStreak={analytics.streaks.currentRunDayStreak}
                  currentRunWeekStreak={analytics.streaks.currentRunWeekStreak}
                  activeGoals={activeGoals}
                  activeShoes={activeShoes.length}
                  preferredUnit={profile.preferred_unit}
                />
                <EffortZonesPanel
                  effortZoneRows={effortZoneRows}
                  preferredUnit={profile.preferred_unit}
                />
                <RecoverySignalsPanel signals={analytics.recoverySignals} />
              </div>
              <AiInsightsPanel />
            </section>
          }
          history={
            <RunHistorySection
              title="Run history"
              description="Saved runs with pace, shoe, and effort details."
              runs={historyRuns}
              preferredUnit={profile.preferred_unit}
            />
          }
        />
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
    <article className="min-h-[7rem] rounded-lg bg-card p-4 text-card-foreground shadow-sm ring-1 ring-border/70 transition hover:-translate-y-0.5 hover:ring-primary/25 hover:shadow-md">
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

function CurrentTrainingCard({
  latestWeek,
  latestMonth,
  currentRunDayStreak,
  currentRunWeekStreak,
  activeGoals,
  activeShoes,
  preferredUnit,
}: {
  latestWeek: PeriodMileage | null;
  latestMonth: PeriodMileage | null;
  currentRunDayStreak: number;
  currentRunWeekStreak: number;
  activeGoals: number;
  activeShoes: number;
  preferredUnit: "metric" | "imperial";
}) {
  const items = [
    {
      label: "Latest week",
      value: formatPeriodDistance(latestWeek, preferredUnit),
      detail: formatPeriodDetail(latestWeek),
    },
    {
      label: "Latest month",
      value: formatPeriodDistance(latestMonth, preferredUnit),
      detail: formatPeriodDetail(latestMonth),
    },
    {
      label: "Run streak",
      value: `${currentRunDayStreak} day${currentRunDayStreak === 1 ? "" : "s"}`,
      detail: `${currentRunWeekStreak} active week${currentRunWeekStreak === 1 ? "" : "s"}`,
    },
    {
      label: "Training context",
      value: `${activeGoals} goal${activeGoals === 1 ? "" : "s"}`,
      detail: `${activeShoes} active shoe${activeShoes === 1 ? "" : "s"}`,
    },
  ];

  return (
    <section className="rounded-lg bg-card p-4 text-card-foreground shadow-sm ring-1 ring-border/70">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Current training</h2>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Volume, consistency, and account context.
          </p>
        </div>
        <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
      </div>
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="min-w-0">
            <dt className="text-xs font-medium uppercase text-muted-foreground">
              {item.label}
            </dt>
            <dd className="mt-1 text-xl font-semibold leading-none">
              {item.value}
            </dd>
            <dd className="mt-1 text-sm leading-5 text-muted-foreground">
              {item.detail}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function EffortZonesPanel({
  effortZoneRows,
  preferredUnit,
}: {
  effortZoneRows: Array<{
    label: string;
    zone: {
      runCount: number;
      distanceMeters: number;
    };
  }>;
  preferredUnit: "metric" | "imperial";
}) {
  return (
    <section className="rounded-lg bg-card p-4 text-card-foreground shadow-sm ring-1 ring-border/70">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Effort zones</h2>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Logged effort distribution.
          </p>
        </div>
        <Gauge className="h-4 w-4 text-primary" aria-hidden="true" />
      </div>
      <dl className="grid gap-2">
        {effortZoneRows.map(({ label, zone }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 rounded-md bg-background/70 px-3 py-2"
          >
            <dt className="text-sm font-medium">{label}</dt>
            <dd className="text-right text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {zone.runCount}
              </span>{" "}
              / {formatDistance(zone.distanceMeters, preferredUnit)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function RecoverySignalsPanel({ signals }: { signals: RecoverySignal[] }) {
  return (
    <section className="rounded-lg bg-card p-4 text-card-foreground shadow-sm ring-1 ring-border/70">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Recovery signals</h2>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Recent load and effort checks.
          </p>
        </div>
        <Flame className="h-4 w-4 text-primary" aria-hidden="true" />
      </div>
      {signals.length > 0 ? (
        <ul className="grid gap-2">
          {signals.map((signal) => (
            <li
              key={`${signal.kind}-${signal.message}`}
              className="rounded-md bg-background/70 px-3 py-2"
            >
              <span
                className={`text-xs font-semibold uppercase ${getRecoverySignalClassName(signal)}`}
              >
                {signal.severity}
              </span>
              <p className="mt-1 text-sm leading-5">{signal.message}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed bg-background/70 px-3 py-4 text-sm leading-6 text-muted-foreground">
          No recovery signals in the current training window.
        </p>
      )}
    </section>
  );
}

function RunHistorySection({
  title,
  description,
  runs,
  preferredUnit,
  compact = false,
}: {
  title: string;
  description: string;
  runs: Array<{
    id: string;
    run_date: string;
    distance_meters: number;
    duration_seconds: number;
    effort: number | null;
    shoes?: Parameters<typeof getShoeName>[0]["shoes"];
  }>;
  preferredUnit: "metric" | "imperial";
  compact?: boolean;
}) {
  return (
    <section className="flex min-h-[18rem] flex-col rounded-lg bg-card p-4 text-card-foreground shadow-sm ring-1 ring-border/70 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
        <Footprints className="h-4 w-4 text-primary" aria-hidden="true" />
      </div>

      {runs.length > 0 ? (
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="hidden grid-cols-[1fr_0.8fr_0.8fr_0.7fr_1.1fr_0.6fr] gap-4 border-b pb-3 text-xs font-medium uppercase text-muted-foreground lg:grid">
            <span>Date</span>
            <span>Distance</span>
            <span>Duration</span>
            <span>Pace</span>
            <span className={compact ? "hidden lg:block" : ""}>Shoe</span>
            <span>Effort</span>
          </div>
          <ul className="divide-y" aria-label={title}>
            {runs.map((run) => {
              const shoeName = getShoeName(run);
              const pace = formatPace(
                getAveragePaceSecondsPerKm(run),
                preferredUnit,
              );

              return (
                <li key={run.id}>
                  <Link
                    href={`/runs/${run.id}`}
                    className="grid gap-2 py-3 text-sm transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:grid-cols-2 lg:grid-cols-[1fr_0.8fr_0.8fr_0.7fr_1.1fr_0.6fr] lg:gap-4"
                  >
                    <span className="font-medium">{run.run_date}</span>
                    <span>
                      {formatDistance(run.distance_meters, preferredUnit)}
                    </span>
                    <span>{formatDuration(run.duration_seconds)}</span>
                    <span>{pace}</span>
                    <span
                      className={
                        compact
                          ? "hidden text-muted-foreground lg:block"
                          : "text-muted-foreground"
                      }
                    >
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

function getLatestPeriod(periods: PeriodMileage[]) {
  return periods.at(-1) ?? null;
}

function formatPeriodDistance(
  period: PeriodMileage | null,
  unit: "metric" | "imperial",
) {
  return formatDistance(period?.distanceMeters ?? 0, unit);
}

function formatPeriodDetail(period: PeriodMileage | null) {
  if (!period) {
    return "No runs logged.";
  }

  return `${period.period} / ${period.runCount} run${period.runCount === 1 ? "" : "s"}`;
}

function formatOptionalPace(
  secondsPerKm: number | null,
  unit: "metric" | "imperial",
) {
  return secondsPerKm ? formatPace(secondsPerKm, unit) : "N/A";
}

function getRecoverySignalClassName(signal: RecoverySignal) {
  if (signal.severity === "high") {
    return "text-destructive";
  }

  if (signal.severity === "medium") {
    return "text-primary";
  }

  return "text-muted-foreground";
}
