import { AppShell, type AppShellNavKey } from "@/components/app/app-shell";
import { cn } from "@/lib/utils";

export function AppPageLoading({
  title,
  activeNav,
  variant = "dashboard",
}: {
  title: string;
  activeNav?: AppShellNavKey;
  variant?: "dashboard" | "list" | "form";
}) {
  return (
    <AppShell title={title} activeNav={activeNav}>
      <div className="grid gap-6" role="status" aria-label={`${title} loading`}>
        <div className="grid gap-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>
        {variant === "dashboard" ? <DashboardSkeleton /> : null}
        {variant === "list" ? <ListSkeleton /> : null}
        {variant === "form" ? <FormSkeleton /> : null}
      </div>
    </AppShell>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
        <Skeleton className="h-[40rem] rounded-xl" />
        <Skeleton className="h-[40rem] rounded-xl" />
      </div>
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-20 rounded-xl" />
      <div className="rounded-xl border bg-card p-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-3 border-b py-4 last:border-b-0 lg:grid-cols-[1.4fr_1fr_auto]"
          >
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-9 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="grid gap-4 rounded-xl border bg-card p-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-12 rounded-xl" />
      ))}
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/80", className)}
      aria-hidden="true"
    />
  );
}
