import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EmailPasswordPanelClient } from "@/components/auth/email-password-panel-client";

describe("EmailPasswordPanel", () => {
  const renderPanel = (
    props: Partial<React.ComponentProps<typeof EmailPasswordPanelClient>> = {},
  ) => {
    const signInAction = vi.fn();
    const signUpAction = vi.fn();

    render(
      <EmailPasswordPanelClient
        authMessage={null}
        signInAction={signInAction}
        signUpAction={signUpAction}
        {...props}
      />,
    );

    return { signInAction, signUpAction };
  };

  it("renders sign in as the default email auth mode", () => {
    renderPanel();

    expect(
      screen.getByRole("button", { name: "Sign in", pressed: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account", pressed: false }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    expect(
      screen.getAllByRole("button", { name: /^Sign in$/ })[1],
    ).toBeInTheDocument();
  });

  it("switches to the create account form without rendering duplicate fields", async () => {
    renderPanel();

    fireEvent.click(screen.getByText("New to Laelaps? Create an account"));

    expect(screen.getAllByLabelText("Email")).toHaveLength(1);
    expect(screen.getAllByLabelText("Password")).toHaveLength(1);
    expect(
      screen.getAllByRole("button", { name: /^Create account$/ })[1],
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
    expect(screen.getByText("Already have an account? Sign in")).toBeVisible();
  });

  it("shows auth messages with an accessible status role", () => {
    renderPanel({
      authMessage: {
        kind: "notice",
        text: "Check your email to confirm your account.",
      },
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Check your email to confirm your account.",
    );
  });
});
