"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "training", label: "Training" },
  { key: "history", label: "History" },
] as const;

export type DashboardTabKey = (typeof tabs)[number]["key"];

export function DashboardTabs({
  overview,
  training,
  history,
}: {
  overview: ReactNode;
  training: ReactNode;
  history: ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(() => normalizeTab(urlTab));

  useEffect(() => {
    setActiveTab(normalizeTab(urlTab));
  }, [urlTab]);

  function selectTab(tab: DashboardTabKey) {
    setActiveTab(tab);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("tab", tab);
    router.replace(`/dashboard?${nextParams.toString()}`, { scroll: false });
  }

  return (
    <section className="grid gap-4">
      <div
        className="flex gap-1 overflow-x-auto border-b"
        role="tablist"
        aria-label="Dashboard sections"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`dashboard-${tab.key}-panel`}
              id={`dashboard-${tab.key}-tab`}
              className={cn(
                "relative h-10 shrink-0 px-3 text-sm font-semibold text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-4",
                isActive
                  ? "text-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
                  : "after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent",
              )}
              onClick={() => selectTab(tab.key)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <DashboardTabPanel tab="overview" activeTab={activeTab}>
        {overview}
      </DashboardTabPanel>
      <DashboardTabPanel tab="training" activeTab={activeTab}>
        {training}
      </DashboardTabPanel>
      <DashboardTabPanel tab="history" activeTab={activeTab}>
        {history}
      </DashboardTabPanel>
    </section>
  );
}

function DashboardTabPanel({
  tab,
  activeTab,
  children,
}: {
  tab: DashboardTabKey;
  activeTab: DashboardTabKey;
  children: ReactNode;
}) {
  const isActive = tab === activeTab;

  return (
    <div
      id={`dashboard-${tab}-panel`}
      role="tabpanel"
      aria-labelledby={`dashboard-${tab}-tab`}
      hidden={!isActive}
      className={isActive ? "grid gap-4" : "hidden"}
    >
      {children}
    </div>
  );
}

function normalizeTab(value: string | null): DashboardTabKey {
  return tabs.some((tab) => tab.key === value)
    ? (value as DashboardTabKey)
    : "overview";
}
