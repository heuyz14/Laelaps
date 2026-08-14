"use client";

import { Check, LoaderCircle, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { RunSummaryOutput } from "@/lib/ai/run-summary";

type RunSummaryResponse = {
  output: RunSummaryOutput;
  insight: { id: string };
};

export function RunSummaryPanel({ runId }: { runId: string }) {
  const [summary, setSummary] = useState<RunSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateSummary() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/run-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });
      const payload = (await response.json()) as
        | RunSummaryResponse
        | { error?: string };

      if (!response.ok) {
        setError(
          getErrorMessage(response.status, "error" in payload ? payload : {}),
        );
        return;
      }

      setSummary(payload as RunSummaryResponse);
    } catch {
      setError("Unable to reach the summary service. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="grid gap-4 rounded-lg border bg-card p-6 text-card-foreground">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <h3 className="text-lg font-semibold">Run summary</h3>
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Get a grounded explanation using this run and your recent history.
          </p>
        </div>
        <Button
          type="button"
          variant={summary ? "outline" : "default"}
          onClick={generateSummary}
          disabled={isLoading}
          aria-label={
            summary ? "Regenerate run summary" : "Generate run summary"
          }
        >
          {isLoading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : summary ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          )}
          {isLoading
            ? "Generating"
            : summary
              ? "Regenerate"
              : "Generate summary"}
        </Button>
      </div>

      {error ? (
        <p
          className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {summary ? (
        <div className="grid gap-4 border-t pt-4">
          <div>
            <p className="text-sm leading-6">{summary.output.summary}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Confidence: {summary.output.confidence}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryItem label="Highlights" items={summary.output.highlights} />
            <SummaryItem
              label="Suggested improvement"
              items={[summary.output.suggestedImprovement]}
            />
          </div>
          <div className="rounded-md bg-muted/60 p-3">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Comparison
            </p>
            <p className="mt-1 text-sm leading-6">
              {summary.output.comparison}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SummaryItem({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <ul className="mt-2 grid gap-2 text-sm leading-6 text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function getErrorMessage(status: number, payload: { error?: string }) {
  if (status === 401) return "Sign in again to generate a summary.";
  if (status === 404) return "This run is no longer available.";
  if (status === 503)
    return "AI summaries are not configured for this environment.";
  return payload.error ?? "Unable to generate a summary. Try again.";
}
