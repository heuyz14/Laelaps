import type { ReactNode } from "react";
import {
  BarChart3,
  Footprints,
  Goal,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    key: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  { key: "runs", href: "/runs", label: "Runs", icon: BarChart3 },
  { key: "shoes", href: "/shoes", label: "Shoes", icon: Footprints },
  { key: "goals", href: "/goals", label: "Goals", icon: Goal },
  { key: "settings", href: "/settings", label: "Settings", icon: Settings },
] as const;

export type AppShellNavKey = (typeof navItems)[number]["key"];

type AppShellProps = {
  title: string;
  activeNav?: AppShellNavKey;
  eyebrow?: string;
  children: ReactNode;
};

export function AppShell({
  activeNav,
  eyebrow = "Laelaps",
  children,
}: AppShellProps) {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-background/95 shadow-[0_1px_12px_rgba(25,27,31,0.05)] backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-[92rem] flex-col gap-3 px-4 py-3 sm:px-6 lg:min-h-16 lg:flex-row lg:items-center lg:justify-between lg:px-6 lg:py-0 xl:px-7">
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:gap-7">
            <Link
              href="/dashboard"
              className="flex shrink-0 items-center gap-3 text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`${eyebrow} dashboard`}
            >
              <Footprints
                className="h-[1.125rem] w-[1.125rem] text-primary"
                aria-hidden="true"
              />
              <span className="text-lg font-semibold tracking-normal">
                {eyebrow}
              </span>
            </Link>
            <nav
              className="flex min-w-0 gap-1 overflow-x-auto lg:h-16 lg:overflow-visible"
              aria-label="Primary"
            >
              {navItems.map((item) => {
                const isActive = item.key === activeNav;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-4 lg:h-16 lg:px-4",
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <Button
            variant="outline"
            asChild
            className="h-9 self-start rounded-lg px-3.5 lg:self-auto"
          >
            <a href="/auth/sign-out">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </a>
          </Button>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 lg:px-6 lg:py-6 xl:px-7">
        {children}
      </div>
    </main>
  );
}

export function StatusMessage({
  kind,
  children,
}: {
  kind: "notice" | "error";
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        kind === "notice"
          ? "border-primary/20 bg-primary/10 text-accent-foreground"
          : "border-destructive/25 bg-destructive/10 text-destructive",
      )}
      role={kind === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
