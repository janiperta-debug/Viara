"use client";

import { useState } from "react";
import { ChevronRight, X, MapPin } from "lucide-react";
import type { AsiakasAlue } from "@/lib/asiakas-data";

export function HoitoalueetNakyma({ alueet }: { alueet: AsiakasAlue[] }) {
  const [valittuId, setValittuId] = useState(alueet[0]?.id ?? null);
  const [mobiiliAuki, setMobiiliAuki] = useState(false);

  const valittu = alueet.find((alue) => alue.id === valittuId) ?? alueet[0] ?? null;

  function avaa(id: string) {
    setValittuId(id);
    setMobiiliAuki(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">Hoitoalueet</h1>
        <p className="mt-1 text-base text-muted">
          {alueet.length} hoitoaluetta hallinnassasi
        </p>
      </header>

      {alueet.length === 0 ? (
        <p className="metal-card rounded-2xl p-5 text-sm text-muted">
          Asiakkuudelle ei ole vielä määritetty hoitoalueita.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
          <ul className="flex flex-col gap-3">
            {alueet.map((alue) => {
              const aktiivinen = alue.id === valittuId;
              return (
                <li key={alue.id}>
                  <button
                    type="button"
                    onClick={() => avaa(alue.id)}
                    aria-current={aktiivinen ? "true" : undefined}
                    className={`metal-card flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hover:-translate-y-0.5 ${
                      aktiivinen ? "ring-2 ring-primary lg:ring-primary/60" : ""
                    }`}
                  >
                    <span
                      className={`h-10 w-1.5 shrink-0 rounded-full ${
                        alue.tila === "valmis"
                          ? "bg-green-600"
                          : alue.tila === "tyon_alla"
                            ? "bg-amber-600"
                            : "bg-red-600"
                      }`}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-semibold text-foreground">
                        {alue.nimi}
                      </span>
                      <span className="block truncate text-sm text-muted">
                        {alue.osoite ?? "Ei osoitetta"}
                      </span>
                      <span className="mt-1 block text-xs font-medium text-muted">
                        {tilaLabel(alue.tila)} · {alue.edistyma} %
                      </span>
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted lg:hidden" />
                  </button>
                </li>
              );
            })}
          </ul>

          {valittu && (
            <div className="hidden lg:sticky lg:top-24 lg:block">
              <Detalji alue={valittu} />
            </div>
          )}
        </div>
      )}

      {mobiiliAuki && valittu && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={valittu.nimi}
          onClick={() => setMobiiliAuki(false)}
        >
          <div
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-background pb-[max(1rem,env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end px-4 pt-4">
              <button
                type="button"
                onClick={() => setMobiiliAuki(false)}
                aria-label="Sulje"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-muted shadow-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-4 pb-4">
              <Detalji alue={valittu} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function tilaLabel(tila: AsiakasAlue["tila"]) {
  if (tila === "valmis") return "Valmis";
  if (tila === "tyon_alla") return "Työn alla";
  return "Aloittamatta";
}

function TilaVari({ tila }: { tila: AsiakasAlue["tila"] }) {
  const className =
    tila === "valmis"
      ? "bg-green-600"
      : tila === "tyon_alla"
        ? "bg-amber-600"
        : "bg-red-600";
  return <span className={`h-2 w-2 rounded-full ${className}`} aria-hidden />;
}

function Detalji({ alue }: { alue: AsiakasAlue }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="metal-card rounded-3xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground">{alue.nimi}</h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="h-4 w-4 shrink-0" />
              {alue.osoite ?? "Ei osoitetta"}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-sm">
            <TilaVari tila={alue.tila} />
            {tilaLabel(alue.tila)}
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Edistymä</span>
            <span className="font-semibold text-foreground">{alue.edistyma} %</span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-white shadow-inner">
            <div
              className={`h-full rounded-full ${
                alue.tila === "valmis"
                  ? "bg-green-600"
                  : alue.tila === "tyon_alla"
                    ? "bg-amber-600"
                    : "bg-red-600"
              }`}
              style={{ width: `${alue.edistyma}%` }}
            />
          </div>
        </div>

        {alue.kiinteistotunnus && (
          <p className="mt-3 text-sm text-muted">
            Kiinteistötunnus: <span className="font-medium text-foreground">{alue.kiinteistotunnus}</span>
          </p>
        )}

        <p className="mt-3 text-sm text-muted">
          {alue.viimeisinTapahtuma
            ? `Viimeisin työn tilatapahtuma: ${new Date(alue.viimeisinTapahtuma).toLocaleString("fi-FI")}`
            : "Työstä ei ole vielä kirjattu tilatapahtumaa."}
        </p>
      </div>
    </div>
  );
}
