import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateRun } from "@/app/dashboard/actions";
import { AppShell, StatusMessage } from "@/components/app/app-shell";
import { RunForm } from "@/components/runs/run-form";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { ensureUserProfile } from "@/lib/profiles";
import { getRunById } from "@/lib/runs";
import { getShoes } from "@/lib/shoes";

export default async function EditRunPage({
  params,
  searchParams,
}: {
  params: Promise<{ runId: string }>;
  searchParams?: Promise<{ run_error?: string | string[] }>;
}) {
  const { runId } = await params;
  const { supabase, user } = await getAuthenticatedContext();
  const [profile, run, shoes] = await Promise.all([
    ensureUserProfile(supabase, user),
    getRunById(supabase, runId),
    getShoes(supabase),
  ]);

  if (!run) {
    notFound();
  }

  const updateRunWithId = updateRun.bind(null, run.id);
  const paramsValue = searchParams ? await searchParams : {};
  const runError = firstParam(paramsValue.run_error);

  return (
    <AppShell title="Edit run">
      <div className="mx-auto grid max-w-3xl gap-6">
        <Link
          href={`/runs/${run.id}`}
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Run detail
        </Link>
        <section className="rounded-lg border bg-card p-6 text-card-foreground">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">Update run</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Changes stay within your account boundary through Supabase RLS.
            </p>
          </div>

          {runError ? (
            <div className="mb-4">
              <StatusMessage kind="error">
                {runError === "invalid_run"
                  ? "Check your run details and try again."
                  : "Unable to update this run."}
              </StatusMessage>
            </div>
          ) : null}

          <RunForm
            action={updateRunWithId}
            submitLabel="Update run"
            preferredUnit={profile.preferred_unit}
            shoes={shoes}
            run={run}
          />
        </section>
      </div>
    </AppShell>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
