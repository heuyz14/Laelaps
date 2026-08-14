"use client";

import { Brain, Loader2, Send, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

type ChatMode = "coach" | "recovery" | "history";

type Analysis = {
  summary?: string;
  directAnswer?: string;
  weeklySummary?: string;
  recommendation?: string;
  nextRunSuggestion?: string;
  suggestedNextAction?: string;
  riskFlags?: string[];
  evidence?: string[];
  likelyContributors?: string[];
  caveats?: string[];
  confidence?: string;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  title?: string;
  body: string;
  items?: Array<{ label: string; values: string[] }>;
  tone?: "normal" | "error";
};

type TrainingMetrics = {
  totalDistance: string;
  runCount: number;
  averagePace: string;
  longestRun: string;
};

const modes: Array<{
  key: ChatMode;
  label: string;
  placeholder: string;
}> = [
  {
    key: "coach",
    label: "Next run",
    placeholder: "How far should I run today?",
  },
  {
    key: "recovery",
    label: "Recovery",
    placeholder: "Should I keep today's run easy?",
  },
  {
    key: "history",
    label: "History",
    placeholder: "What has changed in my recent training?",
  },
];

export function AiInsightsPanel({ metrics }: { metrics: TrainingMetrics }) {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<ChatMode>("coach");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      title: "AI training review",
      body: "Ask for a next-run suggestion, a recovery read, or a history-based answer. I will use your saved runs and deterministic metrics.",
    },
  ]);
  const activeMode = useMemo(
    () => modes.find((item) => item.key === mode) ?? modes[0],
    [mode],
  );

  async function runAnalysis() {
    const prompt = question.trim();
    if (loading || (mode !== "recovery" && prompt.length < 3)) return;

    const userMessage = prompt || "Check my current recovery signals.";
    const metricAnswer = getMetricAnswer(prompt, metrics);
    if (metricAnswer) {
      setQuestion("");
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "user",
          body: userMessage,
        },
        metricAnswer,
      ]);
      return;
    }

    setLoading(true);
    setQuestion("");
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        body: userMessage,
      },
    ]);

    try {
      const response = await fetch(endpointForMode(mode), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(mode === "history" ? { question: prompt } : {}),
      });
      const body = (await response.json()) as {
        output?: Analysis;
        error?: string;
      };
      if (!response.ok) throw new Error(body.error ?? "Analysis unavailable.");

      setMessages((current) => [
        ...current,
        formatAssistantMessage(mode, body.output ?? {}),
      ]);
    } catch (cause) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          tone: "error",
          title: "Review unavailable",
          body:
            cause instanceof Error
              ? getFriendlyError(cause.message)
              : "I could not reach the AI review service. Try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[34rem] flex-col rounded-lg bg-card text-card-foreground shadow-sm ring-1 ring-border/70">
      <div className="border-b p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" aria-hidden="true" />
              <h3 className="font-semibold">AI training chat</h3>
            </div>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              Grounded in your saved runs, goals, and verified metrics.
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
          aria-label="AI chat mode"
        >
          {modes.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setMode(item.key)}
              className={modeButton(mode === item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="grid max-h-[28rem] flex-1 content-start gap-3 overflow-y-auto p-4 sm:p-5"
        aria-live="polite"
      >
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {loading ? (
          <div className="mr-auto max-w-[88%] rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Reviewing your training data...
            </span>
          </div>
        ) : null}
      </div>

      <form
        className="border-t p-4 sm:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void runAnalysis();
        }}
      >
        <label className="sr-only" htmlFor="ai-training-question">
          Training question
        </label>
        <div className="grid gap-2">
          <textarea
            id="ai-training-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder={activeMode.placeholder}
            className="block min-h-20 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {mode === "coach"
                ? "Best for today, distance, and next-run questions."
                : mode === "recovery"
                  ? "You can send this blank to check current signals."
                  : "Best for trends and what changed over time."}
            </p>
            <button
              type="submit"
              disabled={
                loading || (mode !== "recovery" && question.trim().length < 3)
              }
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              Send
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <article
      className={`max-w-[88%] rounded-lg px-3 py-2 text-sm leading-6 ${
        isUser
          ? "ml-auto bg-primary text-primary-foreground"
          : message.tone === "error"
            ? "mr-auto border border-destructive/25 bg-destructive/10 text-destructive"
            : "mr-auto bg-muted text-foreground"
      }`}
    >
      {message.title ? (
        <h4 className="mb-1 text-sm font-semibold">{message.title}</h4>
      ) : null}
      <p>{message.body}</p>
      {message.items?.length ? (
        <div className="mt-3 grid gap-2">
          {message.items.map((item) =>
            item.values.length ? (
              <div key={item.label}>
                <p className="text-xs font-semibold uppercase tracking-normal opacity-75">
                  {item.label}
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {item.values.map((value) => (
                    <li key={value}>{value}</li>
                  ))}
                </ul>
              </div>
            ) : null,
          )}
        </div>
      ) : null}
    </article>
  );
}

function endpointForMode(mode: ChatMode) {
  if (mode === "coach") return "/api/ai/training-coach";
  if (mode === "recovery") return "/api/ai/recovery-analysis";
  return "/api/ai/historical-analysis";
}

function formatAssistantMessage(
  mode: ChatMode,
  analysis: Analysis,
): ChatMessage {
  if (mode === "coach") {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      title: "Next run suggestion",
      body:
        analysis.nextRunSuggestion ??
        analysis.recommendation ??
        "I could not find a specific next-run suggestion in the response.",
      items: [
        {
          label: "Context",
          values: [analysis.weeklySummary, analysis.recommendation].filter(
            Boolean,
          ) as string[],
        },
        { label: "Signals", values: analysis.riskFlags ?? [] },
      ],
    };
  }

  if (mode === "recovery") {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      title: "Recovery review",
      body:
        analysis.summary ??
        analysis.recommendation ??
        "I could not find a recovery summary in the response.",
      items: [
        { label: "Signals", values: analysis.riskFlags ?? [] },
        {
          label: "Next action",
          values: [analysis.recommendation].filter(Boolean) as string[],
        },
      ],
    };
  }

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    title: "History answer",
    body:
      analysis.directAnswer ??
      analysis.summary ??
      "I could not find a direct history answer in the response.",
    items: [
      { label: "Evidence", values: analysis.evidence ?? [] },
      { label: "Contributors", values: analysis.likelyContributors ?? [] },
      { label: "Caveats", values: analysis.caveats ?? [] },
      {
        label: "Next action",
        values: [analysis.suggestedNextAction].filter(Boolean) as string[],
      },
    ],
  };
}

function getFriendlyError(message: string) {
  if (message.includes("not configured")) {
    return "AI is not configured for this environment. Add the OpenRouter key and use openrouter/free or a :free model.";
  }

  if (message.includes("training history")) {
    return "The history analyst could not produce a valid grounded answer. Try the Next run mode for distance or today's workout questions.";
  }

  if (message.includes("training guidance")) {
    return "The training coach could not produce a valid next-run suggestion. Try again, or switch to Recovery for a simpler signal check.";
  }

  return message;
}

function getMetricAnswer(
  prompt: string,
  metrics: TrainingMetrics,
): ChatMessage | null {
  const normalized = prompt.toLowerCase();
  const asksTotal =
    normalized.includes("total") ||
    normalized.includes("so far") ||
    normalized.includes("overall") ||
    normalized.includes("all my") ||
    normalized.includes("logged");
  const asksDistance =
    normalized.includes("distance") ||
    normalized.includes("far") ||
    normalized.includes("miles") ||
    normalized.includes("kilometers") ||
    normalized.includes("km") ||
    normalized.includes("mi");

  if (asksTotal && asksDistance) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      title: "Total distance",
      body: `Your logged runs total ${metrics.totalDistance}.`,
      items: [
        {
          label: "Dashboard metrics",
          values: [
            `${metrics.runCount} run${metrics.runCount === 1 ? "" : "s"} logged`,
            `Average pace: ${metrics.averagePace}`,
            `Longest run: ${metrics.longestRun}`,
          ],
        },
      ],
    };
  }

  if (
    normalized.includes("how many") &&
    (normalized.includes("runs") || normalized.includes("run"))
  ) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      title: "Run count",
      body: `You have ${metrics.runCount} logged run${metrics.runCount === 1 ? "" : "s"}.`,
    };
  }

  return null;
}

function modeButton(active: boolean) {
  return `rounded-md border px-3 py-1.5 text-sm font-medium transition ${active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`;
}
