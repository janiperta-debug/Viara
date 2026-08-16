"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MapPin, Clock, Info, ChevronRight } from "lucide-react";
import {
  OMA_HOITOALUE,
  HAVAINNOT,
  TILA_MAARITTEET,
  aktiivisiaHavaintoja,
} from "@/lib/asukas-mock";
import { HavaintoKortti, TeeHavaintoModaali } from "./havainnot-jaettu";

export function OmaHoitoalue() {
  const [uusiAuki, setUusiAuki] = useState(false);
  const { label, vari } = TILA_MAARITTEET[OMA_HOITOALUE.tila];
  const aktiiviset = aktiivisiaHavaintoja();
  const esikatselu = HAVAINNOT.slice(0, 2);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Oma hoitoalue</h1>
      </header>

      {/* Kohdekortti */}
      <section className="metal-card rounded-3xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground">
              {OMA_HOITOALUE.nimi}
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="h-4 w-4 shrink-0" />
              {OMA_HOITOALUE.osoite}, {OMA_HOITOALUE.postitoimipaikka}
            </p>
          </div>
        </div>

        {/* Tila */}
        <div className="mt-4 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5" aria-hidden>
            {OMA_HOITOALUE.tila === "tyon_alla" && (
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ backgroundColor: vari }}
              />
            )}
            <span
              className="relative inline-flex h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: vari }}
            />
          </span>
          <span className="text-base font-semibold text-foreground">
            {label}
          </span>
        </div>

        {/* Edistymä */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Talvikunnossapito tänään</span>
            <span className="font-semibold text-foreground">
              {OMA_HOITOALUE.edistyma} %
            </span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-white shadow-inner">
            <div
              className="h-full rounded-full"
              style={{
                width: `${OMA_HOITOALUE.edistyma}%`,
                backgroundColor: vari,
              }}
            />
          </div>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
          <Clock className="h-4 w-4 shrink-0" />
          {OMA_HOITOALUE.viimeisinTapahtuma}
        </p>
      </section>

      {/* Jo aktiivinen havainto -banneri (estää päällekkäiset ilmoitukset) */}
      {aktiiviset > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Info className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <p className="text-sm leading-relaxed text-foreground">
            Hoitoalueella on jo{" "}
            <span className="font-semibold">
              {aktiiviset} aktiivista havaintoa
            </span>
            . Tarkista listalta, onko asiasta jo ilmoitettu ennen uuden
            tekemistä.
          </p>
        </div>
      )}

      {/* Päätoiminto */}
      <button
        type="button"
        onClick={() => setUusiAuki(true)}
        className="btn-primary flex h-16 w-full items-center justify-center gap-2.5 rounded-2xl px-5 text-primary-foreground transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Plus className="h-6 w-6" strokeWidth={2.25} />
        <span className="text-lg font-semibold">Tee havainto</span>
      </button>

      {/* Alueen havainnot -esikatselu */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Hoitoalueen havainnot
          </h2>
          <Link
            href="/asukas/havainnot"
            className="flex items-center gap-1 text-sm font-medium text-primary"
          >
            Näytä kaikki
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {esikatselu.map((h) => (
          <HavaintoKortti key={h.id} havainto={h} />
        ))}
      </section>

      {uusiAuki && <TeeHavaintoModaali onClose={() => setUusiAuki(false)} />}
    </div>
  );
}
