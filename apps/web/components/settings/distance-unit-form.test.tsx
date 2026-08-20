import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DistanceUnitForm } from "@/components/settings/distance-unit-form";

describe("DistanceUnitForm", () => {
  it("selects kilometers by default and exposes an accessible unit choice", () => {
    render(<DistanceUnitForm action={vi.fn()} preferredUnit="km" />);

    expect(screen.getByRole("radio", { name: /kilometers/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /miles/i })).not.toBeChecked();
    expect(
      screen.getByRole("button", { name: /save preference/i }),
    ).toBeVisible();
  });

  it("reflects a saved miles preference", () => {
    render(<DistanceUnitForm action={vi.fn()} preferredUnit="mi" />);

    expect(screen.getByRole("radio", { name: /miles/i })).toBeChecked();
  });
});
