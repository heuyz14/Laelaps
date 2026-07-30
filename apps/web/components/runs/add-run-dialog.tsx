"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { RunForm } from "@/components/runs/run-form";
import { Button } from "@/components/ui/button";
import type { Shoe } from "@/lib/shoes";

export function AddRunDialog({
  action,
  preferredUnit,
  shoes,
}: {
  action: (formData: FormData) => void | Promise<void>;
  preferredUnit: "metric" | "imperial";
  shoes: Shoe[];
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <Button
        type="button"
        className="h-10 rounded-lg px-5 text-sm shadow-[0_12px_24px_rgba(252,76,2,0.16)] md:inline-flex"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add run
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close add run dialog"
            onClick={() => setOpen(false)}
          />
          <section className="relative grid max-h-[min(46rem,calc(100vh-3rem))] w-full max-w-2xl overflow-hidden rounded-xl border bg-card text-card-foreground shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
              <div>
                <h2 id={titleId} className="text-lg font-semibold">
                  Add a run
                </h2>
                <p
                  id={descriptionId}
                  className="mt-1 text-sm leading-5 text-muted-foreground"
                >
                  Save workout details for your training history and dashboard.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              <RunForm
                action={action}
                submitLabel="Save run"
                preferredUnit={preferredUnit}
                shoes={shoes}
              />
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
