"use client";

import { useEffect } from "react";
import { X, Search, Map, SquareStack, UserPlus } from "lucide-react";

const VAIHEET = [
  {
    Icon: Search,
    otsikko: "Hae kiinteistö",
    kuvaus: "Haku osoitteella tai kiinteistötunnuksella.",
  },
  {
    Icon: Map,
    otsikko: "Maanmittauslaitos",
    kuvaus: "Kiinteistörajat haetaan MML:n aineistosta.",
  },
  {
    Icon: SquareStack,
    otsikko: "Valitse palsta / kiinteistö",
    kuvaus: "Vahvista hoitoalueeseen kuuluvat rajat.",
  },
  {
    Icon: UserPlus,
    otsikko: "Luo hoitoalue ja osoita kuljettaja",
    kuvaus: "Hoitoalue tulee näkyviin kuljettajan sovellukseen.",
  },
];

export function LisaaHoitoalueModaali({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lisaa-hoitoalue-otsikko"
    >
      {/* Tausta */}
      <button
        type="button"
        aria-label="Sulje"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />

      {/* Sisältö */}
      <div className="metal-card relative z-10 w-full max-w-lg rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2
              id="lisaa-hoitoalue-otsikko"
              className="text-lg font-semibold text-foreground"
            >
              Lisää hoitoalue
            </h2>
            <p className="mt-1 text-sm text-muted">
              Tuleva työnkulku hoitoalueen luomiseen.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Sulje"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ol className="mt-5 flex flex-col gap-3">
          {VAIHEET.map(({ Icon, otsikko, kuvaus }, i) => (
            <li
              key={otsikko}
              className="flex items-start gap-3 rounded-xl border border-border/60 bg-white/60 p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {i + 1}. {otsikko}
                </p>
                <p className="text-xs text-muted">{kuvaus}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-xs text-muted">
          Maanmittauslaitos-integraatiota ei ole vielä toteutettu. Tämä on
          esitys tulevasta työnkulusta.
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn-primary mt-5 flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold text-primary-foreground"
        >
          Selvä
        </button>
      </div>
    </div>
  );
}
