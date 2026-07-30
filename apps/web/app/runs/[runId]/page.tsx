import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteRun } from "@/app/dashboard/actions";
import { AppShell, StatusMessage } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { ensureUserProfile } from "@/lib/profiles";
import {
  formatDistance,
  formatDuration,
  formatPace,
  getAveragePaceSecondsPerKm,
  getRunById,
  getShoeName,
} from "@/lib/runs";

export default async function RunDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ runId: string }>;
  searchParams?: Promise<{
    run_error?: string | string[];
    run_notice?: string | string[];
  }>;
}) {
  const { runId } = await params;
  const { supabase, user } = await getAuthenticatedContext();
  const [profile, run] = await Promise.all([
    ensureUserProfile(supabase, user),
    getRunById(supabase, runId),
  ]);

  if (!run) {
    notFound();
  }

  const paramsValue = searchParams ? await searchParams : {};
  const runNotice = firstParam(paramsValue.run_notice);
  const runError = firstParam(paramsValue.run_error);
  const deleteRunWithId = deleteRun.bind(null, run.id);
  const shoeName = getShoeName(run);

  return (
    <AppShell title="Run detail" activeNav="runs">
      <div className="grid gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/runs"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Run history
            </Link>
            <h2 className="mt-3 text-3xl font-semibold">
              {formatDistance(run.distance_meters, profile.preferred_unit)} run
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {run.run_date}
              {shoeName ? ` · ${shoeName}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={`/runs/${run.id}/edit`}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit
              </Link>
            </Button>
            <form action={deleteRunWithId}>
              <Button type="submit" variant="outline">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </Button>
            </form>
          </div>
        </div>

        {runNotice === "updated" ? (
          <StatusMessage kind="notice">Run updated.</StatusMessage>
        ) : null}
        {runError ? (
          <StatusMessage kind="error">Unable to delete this run.</StatusMessage>
        ) : null}

        <section className="grid gap-4 md:grid-cols-4">
          <DetailMetric
            label="Distance"
            value={formatDistance(run.distance_meters, profile.preferred_unit)}
          />
          <DetailMetric
            label="Duration"
            value={formatDuration(run.duration_seconds)}
          />
          <DetailMetric
            label="Pace"
            value={formatPace(
              getAveragePaceSecondsPerKm(run),
              profile.preferred_unit,
            )}
          />
          <DetailMetric
            label="Effort"
            value={run.effort ? `${run.effort}/10` : "Not set"}
          />
        </section>

        <section className="grid gap-4 rounded-lg border bg-card p-6 text-card-foreground">
          <h3 className="text-lg font-semibold">Training details</h3>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Detail
              label="Average HR"
              value={formatOptional(run.avg_heart_rate, " bpm")}
            />
            <Detail
              label="Max HR"
              value={formatOptional(run.max_heart_rate, " bpm")}
            />
            <Detail label="Shoe" value={shoeName ?? "Not selected"} />
            <Detail
              label="Logged"
              value={run.created_at?.slice(0, 10) ?? "Unknown"}
            />
          </dl>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
              {run.notes || "No notes for this run."}
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border bg-card p-5 text-card-foreground">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

function formatOptional(value: number | null | undefined, suffix: string) {
  return value ? `${value}${suffix}` : "Not set";
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
