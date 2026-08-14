import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AiInsightsPanel } from "@/components/app/ai-insights-panel";

const metrics = {
  totalDistance: "42.8 km",
  runCount: 7,
  averagePace: "5:18 /km",
  longestRun: "12.4 km",
};

describe("AiInsightsPanel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("routes next-run questions to the training coach chat endpoint", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            output: {
              weeklySummary: "You have logged a steady week.",
              recommendation: "Keep the run aerobic.",
              nextRunSuggestion: "Run 4 easy miles today.",
              riskFlags: [],
              confidence: "medium",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<AiInsightsPanel metrics={metrics} />);
    fireEvent.change(screen.getByLabelText("Training question"), {
      target: { value: "How far should I run today?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/ai/training-coach",
        expect.objectContaining({ method: "POST" }),
      );
    });
    expect(await screen.findByText("Run 4 easy miles today.")).toBeVisible();
    expect(screen.getByText("Keep the run aerobic.")).toBeVisible();
  });

  it("turns history-analysis failures into a useful chat response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ error: "Unable to analyze training history." }),
            { status: 502, headers: { "Content-Type": "application/json" } },
          ),
      ),
    );

    render(<AiInsightsPanel metrics={metrics} />);
    fireEvent.click(screen.getByRole("button", { name: "History" }));
    fireEvent.change(screen.getByLabelText("Training question"), {
      target: { value: "How far should I run today?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(
      await screen.findByText(/Try the Next run mode/i),
    ).toBeInTheDocument();
  });

  it("answers total-distance questions from dashboard metrics without calling AI", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<AiInsightsPanel metrics={metrics} />);
    fireEvent.change(screen.getByLabelText("Training question"), {
      target: { value: "How far was my runs so far total" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(
      await screen.findByText("Your logged runs total 42.8 km."),
    ).toBeVisible();
    expect(screen.getByText("7 runs logged")).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
