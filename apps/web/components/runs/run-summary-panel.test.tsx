import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RunSummaryPanel } from "@/components/runs/run-summary-panel";

const output = {
  summary: "A steady aerobic run.",
  highlights: ["Pace was consistent."],
  comparison: "Comparable history is limited.",
  suggestedImprovement: "Keep the next easy day easy.",
  confidence: "medium",
};

describe("RunSummaryPanel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a generated summary and grounded details", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ output, insight: { id: "insight-1" } }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
      ),
    );

    render(<RunSummaryPanel runId="run-1" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Generate run summary" }),
    );

    await waitFor(() => {
      expect(screen.getByText(output.summary)).toBeInTheDocument();
    });
    expect(screen.getByText("Pace was consistent.")).toBeInTheDocument();
    expect(screen.getByText("Confidence: medium")).toBeInTheDocument();
  });

  it("shows a configuration error without losing the action", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ error: "AI summary service is not configured." }),
            { status: 503, headers: { "Content-Type": "application/json" } },
          ),
      ),
    );

    render(<RunSummaryPanel runId="run-1" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Generate run summary" }),
    );

    expect(
      await screen.findByText(
        "AI summaries are not configured for this environment.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate run summary" }),
    ).toBeEnabled();
  });
});
