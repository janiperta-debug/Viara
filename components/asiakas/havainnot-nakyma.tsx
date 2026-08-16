"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  HOITOALUEET,
  HAVAINNOT,
  YHTEENVETO,
  havainnotAlueelle,
} from "@/lib/asiakas-mock";
import { HavaintoKortti, UusiHavaintoModaali } from "./havainnot-jaettu";

export function HavainnotNakyma() {
  const [uusiAuki, setUusiAuki] = useState(false);

  // Näytetään vain hoitoalueet, joilla on havaintoja (HOITOALUE -> HAVAINNOT).
  const alueetJoillaHavaintoja = HOITOALUEET.filter(
    (a) => havainnotAlueelle(a.id).length > 0,
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Havainnot
          </h1>
          <p className="mt-1 text-base text-muted">
            {HAVAINNOT.length} havaintoa · {YHTEENVETO.avoimetHavainnot} avointa
          </p>
        </div>
        <button
          type="button"
          onClick={() => setUusiAuki(true)}
          className="btn-primary flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-primary-foreground transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Plus className="h-5 w-5" strokeWidth={2.25} />
          <span className="text-base font-semibold">Uusi havainto</span>
        </button>
      </header>

      {/* Havainnot ryhmitelty hoitoalueittain */}
      <div className="flex flex-col gap-7">
        {alueetJoillaHavaintoja.map((alue) => {
          const havainnot = havainnotAlueelle(alue.id);
          return (
            <section
              key={alue.id}
              aria-label={`${alue.nimi} — havainnot`}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h2 className="text-base font-semibold text-foreground">
                  {alue.nimi}
                </h2>
                <span className="text-sm text-muted">{alue.osoite}</span>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {havainnot.map((h) => (
                  <HavaintoKortti key={h.id} havainto={h} naytaAlue={false} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {uusiAuki && <UusiHavaintoModaali onClose={() => setUusiAuki(false)} />}
    </div>
  );
}
