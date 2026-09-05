"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MapPin, Clock, Info, ChevronRight } from "lucide-react";
import type { AsukasHoitoalue } from "@/lib/asukas-data";
import { HavaintoKortti, TeeHavaintoModaali } from "./havainnot-jaettu";

export function OmaHoitoalue({ alue }: { alue: AsukasHoitoalue }) {
  const [uusiAuki, setUusiAuki] = useState(false);
  const tila = {
    valmis: { label: "Valmis", vari: "#16a34a" },
    tyon_alla: { label: "Työn alla", vari: "#d97706" },
    aloittamatta: { label: "Aloittamatta", vari: "#dc2626" },
  }[alue.tila];
  const aktiiviset = alue.havainnot.filter(
    (havainto) => havainto.status === "avoin" || havainto.status === "tyon_alla",
  ).length;
  const esikatselu = alue.havainnot.slice(0, 2);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Oma hoitoalue</h1>
      </header>

      <section className="metal-card rounded-3xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground">{alue.nimi}</h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="h-4 w-4 shrink-0" />
              {alue.osoite ?? "Ei osoitetta"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5" aria-hidden>
            {alue.tila === "tyon_alla" && (
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ backgroundColor: tila.vari }}
              />
            )}
            <span
              className="relative inline-flex h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: tila.vari }}
            />
          </span>
          <span className="text-base font-semibold text-foreground">{tila.label}</span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Talvikunnossapito tänään</span>
            <span className="font-semibold text-foreground">{alue.edistyma} %</span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-white shadow-inner">
            <div
              className="h-full rounded-full"
              style={{ width: `${alue.edistyma}%`, backgroundColor: tila.vari }}
            />
          </div>
        </div>

        {alue.viimeisinTapahtuma && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
            <Clock className="h-4 w-4 shrink-0" />
            {alue.viimeisinTapahtuma}
          </p>
        )}
      </section>

      {aktiiviset > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Info className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <p className="text-sm leading-relaxed text-foreground">
            Hoitoalueella on jo <span className="font-semibold">{aktiiviset} aktiivista havaintoa</span>.
            Tarkista listalta, onko asiasta jo ilmoitettu ennen uuden tekemistä.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setUusiAuki(true)}
        className="btn-primary flex h-16 w-full items-center justify-center gap-2.5 rounded-2xl px-5 text-primary-foreground transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Plus className="h-6 w-6" strokeWidth={2.25} />
        <span className="text-lg font-semibold">Tee havainto</span>
      </button>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Hoitoalueen havainnot</h2>
          <Link href={`/asukas/${alue.id}/havainnot`} className="flex items-center gap-1 text-sm font-medium text-primary">
            Näytä kaikki
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {esikatselu.length > 0 ? (
          esikatselu.map((havainto) => <HavaintoKortti key={havainto.id} havainto={havainto} />)
        ) : (
          <p className="metal-card rounded-2xl p-4 text-sm text-muted">Hoitoalueella ei ole vielä havaintoja.</p>
        )}
      </section>

      {uusiAuki && (
        <TeeHavaintoModaali
          hoitoalueId={alue.id}
          hoitoalueNimi={alue.nimi}
          onClose={() => setUusiAuki(false)}
        />
      )}
    </div>
  );
}
