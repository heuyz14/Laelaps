import { Footprints, Trash2 } from "lucide-react";

import { createShoe, deleteShoe, updateShoe } from "@/app/dashboard/actions";
import { AppShell, StatusMessage } from "@/components/app/app-shell";
import { Field, fieldClassName } from "@/components/app/forms";
import { Button } from "@/components/ui/button";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { getShoes } from "@/lib/shoes";

export default async function ShoesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    shoe_error?: string | string[];
    shoe_notice?: string | string[];
  }>;
}) {
  const { supabase } = await getAuthenticatedContext();
  const shoes = await getShoes(supabase);
  const params = searchParams ? await searchParams : {};
  const shoeNotice = firstParam(params.shoe_notice);
  const shoeError = firstParam(params.shoe_error);

  return (
    <AppShell title="Shoes">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border bg-card p-6 text-card-foreground">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Add shoes</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Track which pair belongs to each logged run.
              </p>
            </div>
            <Footprints className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>

          <div className="mb-4 grid gap-3">
            {shoeNotice ? (
              <StatusMessage kind="notice">
                {shoeNotice === "created"
                  ? "Shoe saved."
                  : shoeNotice === "updated"
                    ? "Shoe updated."
                    : "Shoe deleted."}
              </StatusMessage>
            ) : null}
            {shoeError ? (
              <StatusMessage kind="error">
                {shoeError === "invalid_shoe"
                  ? "Enter a shoe name and try again."
                  : "Unable to save this shoe."}
              </StatusMessage>
            ) : null}
          </div>

          <form action={createShoe} className="grid gap-4">
            <Field label="Shoe name" htmlFor="name">
              <input
                id="name"
                name="name"
                required
                maxLength={120}
                placeholder="Saucony Endorphin Speed"
                className={fieldClassName}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input name="retired" type="checkbox" className="h-4 w-4" />
              Mark as retired
            </label>
            <Button type="submit" className="h-11 rounded-xl">
              Save shoe
            </Button>
          </form>
        </section>

        <section className="rounded-lg border bg-card p-6 text-card-foreground">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Shoe list</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Retired shoes remain available on historical runs.
            </p>
          </div>

          {shoes.length > 0 ? (
            <ul className="divide-y" aria-label="Shoes">
              {shoes.map((shoe) => {
                const updateShoeWithId = updateShoe.bind(null, shoe.id);
                const deleteShoeWithId = deleteShoe.bind(null, shoe.id);

                return (
                  <li key={shoe.id} className="grid gap-3 py-4">
                    <form
                      action={updateShoeWithId}
                      className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]"
                    >
                      <input
                        name="name"
                        defaultValue={shoe.name}
                        required
                        maxLength={120}
                        aria-label={`Name for ${shoe.name}`}
                        className={fieldClassName}
                      />
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                          name="retired"
                          type="checkbox"
                          defaultChecked={Boolean(shoe.retired_at)}
                          className="h-4 w-4"
                        />
                        Retired
                      </label>
                      <Button type="submit" variant="outline">
                        Update
                      </Button>
                    </form>
                    <form action={deleteShoeWithId}>
                      <Button type="submit" variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Delete
                      </Button>
                    </form>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed bg-background/70 p-8 text-center">
              <Footprints
                className="mx-auto h-8 w-8 text-primary"
                aria-hidden="true"
              />
              <p className="mt-3 font-medium">No shoes yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add shoes before assigning them to runs.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
