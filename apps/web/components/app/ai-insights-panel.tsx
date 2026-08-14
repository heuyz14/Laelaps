"use client";

import { Brain, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";

type Analysis = {
  summary?: string;
  directAnswer?: string;
  recommendation?: string;
  suggestedNextAction?: string;
  riskFlags?: string[];
  evidence?: string[];
  confidence?: string;
};

export function AiInsightsPanel() {
  const [question, setQuestion] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [mode, setMode] = useState<"recovery" | "history">("recovery");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const response = await fetch(
        mode === "recovery"
          ? "/api/ai/recovery-analysis"
          : "/api/ai/historical-analysis",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(mode === "history" ? { question } : {}),
        },
      );
      const body = (await response.json()) as {
        output?: Analysis;
        error?: string;
      };
      if (!response.ok) throw new Error(body.error ?? "Analysis unavailable.");
      setAnalysis(body.output ?? null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Analysis unavailable.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg bg-card p-4 text-card-foreground shadow-sm ring-1 ring-border/70 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" aria-hidden="true" />
            <h3 className="font-semibold">AI training review</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Uses your saved deterministic metrics and stores each structured
            result.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Authenticated data only
        </span>
      </div>

      <div
        className="mt-4 flex flex-wrap gap-2"
        role="group"
        aria-label="AI review type"
      >
        <button
          type="button"
          onClick={() => setMode("recovery")}
          className={modeButton(mode === "recovery")}
        >
          Recovery review
        </button>
        <button
          type="button"
          onClick={() => setMode("history")}
          className={modeButton(mode === "history")}
        >
          Ask about history
        </button>
      </div>

      {mode === "history" ? (
        <label className="mt-4 block text-sm font-medium">
          Question
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={500}
            rows={2}
            placeholder="What has changed in my recent training?"
            className="mt-1.5 block w-full resize-y rounded-md border bg-background px-3 py-2 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      ) : null}

      <button
        type="button"
        onClick={runAnalysis}
        disabled={loading || (mode === "history" && question.trim().length < 3)}
        className="mt-3 inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        {loading ? "Reviewing..." : "Run review"}
      </button>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {analysis ? (
        <div className="mt-4 border-t pt-4 text-sm">
          <p className="font-medium">
            {analysis.directAnswer ?? analysis.summary}
          </p>
          {analysis.evidence?.length ? (
            <InsightList title="Evidence" items={analysis.evidence} />
          ) : null}
          {analysis.riskFlags?.length ? (
            <InsightList title="Signals" items={analysis.riskFlags} />
          ) : null}
          <p className="mt-3 text-muted-foreground">
            {analysis.suggestedNextAction ?? analysis.recommendation}
          </p>
          {analysis.confidence ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Confidence: {analysis.confidence}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function InsightList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
        {title}
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function modeButton(active: boolean) {
  return `rounded-md border px-3 py-1.5 text-sm font-medium transition ${active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`;
}
