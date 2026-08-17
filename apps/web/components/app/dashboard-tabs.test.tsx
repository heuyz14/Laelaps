import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardTabs } from "@/components/app/dashboard-tabs";

const navigation = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: navigation.replace,
  }),
  useSearchParams: () => navigation.searchParams,
}));

describe("DashboardTabs", () => {
  beforeEach(() => {
    navigation.replace.mockClear();
    navigation.searchParams = new URLSearchParams();
  });

  it("defaults to overview when no tab is selected", () => {
    render(
      <DashboardTabs
        overview={<p>Overview content</p>}
        training={<p>Training content</p>}
        history={<p>History content</p>}
      />,
    );

    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Overview content")).toBeVisible();
    expect(screen.queryByText("Training content")).not.toBeVisible();
  });

  it("switches panels immediately and preserves existing params", () => {
    navigation.searchParams = new URLSearchParams("run_notice=created");

    render(
      <DashboardTabs
        overview={<p>Overview content</p>}
        training={<p>Training content</p>}
        history={<p>History content</p>}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Training" }));

    expect(screen.getByRole("tab", { name: "Training" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Training content")).toBeVisible();
    expect(screen.queryByText("Overview content")).not.toBeVisible();

    fireEvent.click(screen.getByRole("tab", { name: "History" }));

    expect(screen.getByRole("tab", { name: "History" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("History content")).toBeVisible();
    expect(screen.queryByText("Overview content")).not.toBeVisible();
    expect(navigation.replace).toHaveBeenCalledWith(
      "/dashboard?run_notice=created&tab=history",
      { scroll: false },
    );
  });
});
