"use client";

import { useTransition } from "react";
import { TriangleAlert, Check } from "lucide-react";
import { ratkaisePoikkeama } from "@/app/actions/poikkeamat";
import type { Poikkeama } from "@/lib/poikkeamat";

function aika(aikaleima: string) {
  return new Intl.DateTimeFormat("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(aikaleima));
}

export function PoikkeamatNakyma({
  poikkeamat,
  otsikko = "Poikkeamat",
  kuvaus = "Hoitoalueella on ollut syy, jonka vuoksi työ ei ole edennyt normaalisti.",
  hallinta = false,
}: {
  poikkeamat: Poikkeama[];
  otsikko?: string;
  kuvaus?: string;
  hallinta?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function ratkaise(hoitoalueId: string) {
    startTransition(async () => {
      await ratkaisePoikkeama({ hoitoalueId });
      window.location.reload();
    });
  }

  if (poikkeamat.length === 0) return null;

  return (
    <section className="metal-card rounded-2xl p-4 md:p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <TriangleAlert className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">{otsikko}</h2>
          <p className="mt-0.5 text-sm text-muted">{kuvaus}</p>
        </div>
      </div>

      <ul className="mt-4 divide-y divide-border/60">
        {poikkeamat.map((poikkeama) => (
          <li key={poikkeama.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{poikkeama.hoitoalueNimi}</p>
                {poikkeama.hoitoalueOsoite && <p className="text-xs text-muted">{poikkeama.hoitoalueOsoite}</p>}
                <p className="mt-2 text-sm text-foreground">{poikkeama.kuvaus}</p>
                <p className="mt-2 text-xs text-muted">
                  {aika(poikkeama.aikaleima)} · {poikkeama.tekija} ({poikkeama.tekijaRooli})
                </p>
              </div>
              {hallinta && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => ratkaise(poikkeama.hoitoalueId)}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/20 disabled:cursor-wait disabled:opacity-60"
                >
                  <Check className="h-4 w-4" />
                  <span>Ratkaistu</span>
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
