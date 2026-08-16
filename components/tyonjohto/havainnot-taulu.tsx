"use client";

import { useState } from "react";
import { Search, TriangleAlert } from "lucide-react";
import {
  TYONJOHTO_HAVAINNOT,
  HAVAINTO_TILAT,
  type HavaintoTila,
} from "@/lib/tyonjohto-mock";

type Suodatin = "kaikki" | HavaintoTila;

const SUODATTIMET: { key: Suodatin; label: string }[] = [
  { key: "kaikki", label: "Kaikki" },
  { key: "uusi", label: "Uusi" },
  { key: "kasittelyssa", label: "Käsittelyssä" },
  { key: "kasitelty", label: "Käsitelty" },
];

function TilaMerkki({ tila }: { tila: HavaintoTila }) {
  const { label, vari } = HAVAINTO_TILAT[tila];
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: vari }}
        aria-hidden
      />
      <span className="text-foreground">{label}</span>
    </span>
  );
}

export function HavainnotTaulu() {
  const [suodatin, setSuodatin] = useState<Suodatin>("kaikki");
  const [haku, setHaku] = useState("");

  const nakyvat = TYONJOHTO_HAVAINNOT.filter((h) => {
    const tilaOk = suodatin === "kaikki" || h.tila === suodatin;
    const hakuOk =
      haku.trim() === "" ||
      `${h.otsikko} ${h.hoitoalue} ${h.tekija}`
        .toLowerCase()
        .includes(haku.toLowerCase());
    return tilaOk && hakuOk;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Otsikko + haku */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Havainnot</h1>
          <p className="text-sm text-muted">
            Kentältä ja asukkailta tulleet havainnot
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={haku}
            onChange={(e) => setHaku(e.target.value)}
            placeholder="Hae havaintoa…"
            aria-label="Hae havaintoa"
            className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Suodattimet */}
      <div className="flex flex-wrap gap-2">
        {SUODATTIMET.map(({ key, label }) => {
          const aktiivinen = suodatin === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSuodatin(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                aktiivinen
                  ? "bg-primary text-primary-foreground"
                  : "metal-card text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Taulukko */}
      <div className="metal-card overflow-hidden rounded-2xl">
        {/* Otsikkorivi (työpöytä) */}
        <div className="hidden grid-cols-[2fr_1.5fr_1fr_0.8fr_1fr] gap-4 border-b border-border/70 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted md:grid">
          <span>Havainto</span>
          <span>Hoitoalue</span>
          <span>Tekijä</span>
          <span>Aika</span>
          <span>Tila</span>
        </div>

        <ul>
          {nakyvat.map((h) => (
            <li
              key={h.id}
              className="border-b border-border/60 last:border-0"
            >
              <button
                type="button"
                className="grid w-full grid-cols-1 gap-1 px-5 py-4 text-left hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:grid-cols-[2fr_1.5fr_1fr_0.8fr_1fr] md:items-center md:gap-4"
              >
                <span className="flex items-center gap-2.5">
                  {h.kiireellinen && (
                    <TriangleAlert
                      className="h-4 w-4 shrink-0 text-destructive"
                      strokeWidth={2}
                    />
                  )}
                  <span className="font-medium text-foreground">
                    {h.otsikko}
                  </span>
                </span>
                <span className="text-sm text-muted md:text-foreground">
                  {h.hoitoalue}
                </span>
                <span className="text-sm text-muted">{h.tekija}</span>
                <span className="text-sm tabular-nums text-muted">
                  {h.aika}
                </span>
                <TilaMerkki tila={h.tila} />
              </button>
            </li>
          ))}
        </ul>

        {nakyvat.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-muted">
            Ei havaintoja valituilla suodattimilla.
          </p>
        )}
      </div>
    </div>
  );
}
