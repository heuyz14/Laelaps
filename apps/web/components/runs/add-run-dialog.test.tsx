import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AddRunDialog } from "@/components/runs/add-run-dialog";

describe("AddRunDialog", () => {
  it("opens the run form from the trigger and closes from the close button", () => {
    render(<AddRunDialog action={vi.fn()} preferredUnit="km" shoes={[]} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add run" }));

    expect(
      screen.getByRole("dialog", { name: "Add a run" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes with Escape and click outside", () => {
    render(<AddRunDialog action={vi.fn()} preferredUnit="km" shoes={[]} />);

    fireEvent.click(screen.getByRole("button", { name: "Add run" }));
    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add run" }));
    fireEvent.click(screen.getByLabelText("Close add run dialog"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
