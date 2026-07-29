import { redirect } from "next/navigation";
import { CalendarDays, Footprints, Goal, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ensureUserProfile } from "@/lib/profiles";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const profile = await ensureUserProfile(supabase, user);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground">Laelaps</p>
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <Button variant="outline" asChild>
            <a href="/auth/sign-out">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </a>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">
            Welcome{profile.display_name ? `, ${profile.display_name}` : ""}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            This protected shell proves authentication, session reads, and
            profile bootstrapping. Run logging and analytics come next.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FoundationCard
            icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
            title="Run history"
            value="Next"
            description="Phase 2 will add user-owned run CRUD backed by RLS."
          />
          <FoundationCard
            icon={<Footprints className="h-5 w-5" aria-hidden="true" />}
            title="Shoes"
            value="Ready"
            description="The schema includes shoe records for mileage tracking."
          />
          <FoundationCard
            icon={<Goal className="h-5 w-5" aria-hidden="true" />}
            title="Goals"
            value="Ready"
            description="The schema includes goals for dashboard progress views."
          />
        </div>
      </section>
    </main>
  );
}

function FoundationCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-lg border bg-card p-5 text-card-foreground">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="text-primary">{icon}</div>
      </div>
      <p className="mt-4 text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}
