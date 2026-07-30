import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "@/components/app/app-shell";

describe("AppShell", () => {
  it("marks the explicit active nav item instead of inferring from the title", () => {
    render(
      <AppShell title="Run detail" activeNav="runs">
        <p>Run detail content</p>
      </AppShell>,
    );

    expect(screen.getByRole("link", { name: "Runs" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
