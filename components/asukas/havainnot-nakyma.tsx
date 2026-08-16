"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  HAVAINNOT,
  OMA_HOITOALUE,
  aktiivisiaHavaintoja,
} from "@/lib/asukas-mock";
import { HavaintoKortti, TeeHavaintoModaali } from "./havainnot-jaettu";

export function HavainnotNakyma() {
  const [modaali, setModaali] = useState(false);
  const aktiiviset = aktiivisiaHavaintoja();

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-5">
      <header className="px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Havainnot
        </h1>
        <p className="mt-1 text-sm text-muted">
          Hoitoalueen {OMA_HOITOALUE.nimi} havainnot
        </p>
      </header>

      {/* Uusi havainto -pääpainike */}
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
          {"Hoitoalueella on "}
          <span className="font-medium text-foreground">
            {aktiiviset} avointa havaintoa
          </span>
          {" — tarkista ennen uuden tekemistä, onko asiasta jo ilmoitettu."}
        </p>
      )}

      {/* Kaikki oman hoitoalueen havainnot (myös muiden tekemät) */}
      <div className="mt-5 flex flex-col gap-3">
        {HAVAINNOT.map((h) => (
          <HavaintoKortti key={h.id} havainto={h} />
        ))}
      </div>

      {modaali && <TeeHavaintoModaali onClose={() => setModaali(false)} />}
    </div>
  );
}
