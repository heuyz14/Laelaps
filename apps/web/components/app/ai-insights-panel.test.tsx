import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AiInsightsPanel } from "@/components/app/ai-insights-panel";

describe("AiInsightsPanel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("routes next-run questions to the training chat agent", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            output: {
              answer: "Run 4 easy miles today.",
              evidence: ["Recent load is steady."],
              followUp: "Keep the effort conversational.",
              confidence: "medium",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<AiInsightsPanel />);
    fireEvent.change(screen.getByLabelText("Training question"), {
      target: { value: "How far should I run today?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/ai/training-chat",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            question: "How far should I run today?",
            mode: "coach",
          }),
        }),
      );
    });
    expect(await screen.findByText("Run 4 easy miles today.")).toBeVisible();
    expect(screen.getByText("Recent load is steady.")).toBeVisible();
  });

  it("uses the chat agent for year-to-date distance questions", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            output: {
              answer: "You have run 42.8 km this year.",
              evidence: ["The authenticated training snapshot totals 42.8 km."],
              confidence: "high",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<AiInsightsPanel />);
    fireEvent.change(screen.getByLabelText("Training question"), {
      target: { value: "How far have i ran this year" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/ai/training-chat",
        expect.objectContaining({
          body: JSON.stringify({
            question: "How far have i ran this year",
            mode: "coach",
          }),
        }),
      );
    });
    expect(
      await screen.findByText("You have run 42.8 km this year."),
    ).toBeVisible();
  });

  it("turns chat-agent failures into a useful chat response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ error: "Unable to answer training chat." }),
            { status: 502, headers: { "Content-Type": "application/json" } },
          ),
      ),
    );

    render(<AiInsightsPanel />);
    fireEvent.change(screen.getByLabelText("Training question"), {
      target: { value: "How far have i ran this year" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(
      await screen.findByText(/specific time window/i),
    ).toBeInTheDocument();
  });
});
