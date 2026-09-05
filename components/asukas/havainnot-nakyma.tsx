"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { AsukasHoitoalue } from "@/lib/asukas-data";
import { HavaintoKortti, TeeHavaintoModaali } from "./havainnot-jaettu";

export function HavainnotNakyma({ alue }: { alue: AsukasHoitoalue }) {
  const [modaali, setModaali] = useState(false);
  const aktiiviset = alue.havainnot.filter(
    (havainto) => havainto.status === "avoin" || havainto.status === "tyon_alla",
  ).length;

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-5">
      <header className="px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Havainnot</h1>
        <p className="mt-1 text-sm text-muted">Hoitoalueen {alue.nimi} havainnot</p>
      </header>

      <button
        type="button"
        onClick={() => setModaali(true)}
        className="btn-primary mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 text-primary-foreground transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Plus className="h-5 w-5" strokeWidth={2.25} />
        <span className="text-base font-semibold">Tee havainto</span>
      </button>

      {aktiiviset > 0 && (
        <p className="mt-3 px-1 text-sm text-muted">
          Hoitoalueella on <span className="font-medium text-foreground">{aktiiviset} avointa havaintoa</span>
          {" — tarkista ennen uuden tekemistä, onko asiasta jo ilmoitettu."}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3">
        {alue.havainnot.length > 0 ? (
          alue.havainnot.map((havainto) => (
            <HavaintoKortti key={havainto.id} havainto={havainto} />
          ))
        ) : (
          <p className="metal-card rounded-2xl p-4 text-sm text-muted">
            Hoitoalueella ei ole vielä havaintoja.
          </p>
        )}
      </div>

      {modaali && (
        <TeeHavaintoModaali
          hoitoalueNimi={alue.nimi}
          onClose={() => setModaali(false)}
        />
      )}
    </div>
  );
}
