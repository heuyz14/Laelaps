import { Settings } from "lucide-react";

import { updatePreferredUnit } from "@/app/dashboard/actions";
import { AppShell, StatusMessage } from "@/components/app/app-shell";
import { DistanceUnitForm } from "@/components/settings/distance-unit-form";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { ensureUserProfile } from "@/lib/profiles";

type SettingsSearchParams = {
  settings_error?: string | string[];
  settings_notice?: string | string[];
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<SettingsSearchParams>;
}) {
  const { supabase, user } = await getAuthenticatedContext();
  const [profile, params] = await Promise.all([
    ensureUserProfile(supabase, user),
    searchParams ?? Promise.resolve<SettingsSearchParams>({}),
  ]);
  const notice = firstParam(params.settings_notice);
  const error = firstParam(params.settings_error);

  return (
    <AppShell title="Settings" activeNav="settings">
      <div className="mx-auto grid max-w-3xl gap-6">
        <section className="rounded-lg border bg-card p-6 text-card-foreground">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Settings</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Choose how Laelaps displays distance across your dashboard and
                AI training chat.
              </p>
            </div>
            <Settings className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          {notice === "updated" ? (
            <div className="mb-4">
              <StatusMessage kind="notice">Preference saved.</StatusMessage>
            </div>
          ) : null}
          {error ? (
            <div className="mb-4">
              <StatusMessage kind="error">
                {error === "invalid_unit"
                  ? "Choose kilometers or miles."
                  : "Unable to save your distance preference."}
              </StatusMessage>
            </div>
          ) : null}
          <DistanceUnitForm
            action={updatePreferredUnit}
            preferredUnit={profile.preferred_unit}
          />
        </section>
      </div>
    </AppShell>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
