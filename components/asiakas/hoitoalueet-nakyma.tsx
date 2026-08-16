"use client";

import { useState } from "react";
import { ChevronRight, Plus, X, Clock, MapPin } from "lucide-react";
import {
  HOITOALUEET,
  TILA_MAARITTEET,
  havainnotAlueelle,
  avoimetHavainnotAlueelle,
  type Hoitoalue,
} from "@/lib/asiakas-mock";
import { HavaintoKortti, UusiHavaintoModaali } from "./havainnot-jaettu";

export function HoitoalueetNakyma() {
  const [valittuId, setValittuId] = useState(HOITOALUEET[0].id);
  const [mobiiliAuki, setMobiiliAuki] = useState(false);
  const [uusiAlueId, setUusiAlueId] = useState<string | null>(null);

  const valittu =
    HOITOALUEET.find((a) => a.id === valittuId) ?? HOITOALUEET[0];

  function avaa(id: string) {
    setValittuId(id);
    setMobiiliAuki(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">
          Hoitoalueet
        </h1>
        <p className="mt-1 text-base text-muted">
          {HOITOALUEET.length} hoitoaluetta hallinnassasi
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        {/* Lista */}
        <ul className="flex flex-col gap-3">
          {HOITOALUEET.map((alue) => {
            const { label, vari } = TILA_MAARITTEET[alue.tila];
            const avoimet = avoimetHavainnotAlueelle(alue.id);
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
                    className="h-10 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: vari }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-semibold text-foreground">
                      {alue.nimi}
                    </span>
                    <span className="block truncate text-sm text-muted">
                      {alue.osoite}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: vari }}
                        aria-hidden
                      />
                      {label} · {alue.edistyma} %
                    </span>
                  </span>
                  {avoimet > 0 && (
                    <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                      {avoimet}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted lg:hidden" />
                </button>
              </li>
            );
          })}
        </ul>

        {/* Detalji — työpöydällä oikea sarake */}
        <div className="hidden lg:sticky lg:top-24 lg:block">
          <Detalji
            alue={valittu}
            onUusiHavainto={() => setUusiAlueId(valittu.id)}
          />
        </div>
      </div>

      {/* Detalji — mobiilissa modaali */}
      {mobiiliAuki && (
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
              <Detalji
                alue={valittu}
                onUusiHavainto={() => setUusiAlueId(valittu.id)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Uusi havainto -modaali (lukittu valittuun alueeseen) */}
      {uusiAlueId && (
        <UusiHavaintoModaali
          lukittuAlueId={uusiAlueId}
          onClose={() => setUusiAlueId(null)}
        />
      )}
    </div>
  );
}

function Detalji({
  alue,
  onUusiHavainto,
}: {
  alue: Hoitoalue;
  onUusiHavainto: () => void;
}) {
  const { label, vari } = TILA_MAARITTEET[alue.tila];
  const havainnot = havainnotAlueelle(alue.id);

  return (
    <div className="flex flex-col gap-4">
      {/* Perustiedot */}
      <div className="metal-card rounded-3xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground">{alue.nimi}</h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="h-4 w-4 shrink-0" />
              {alue.osoite}, {alue.postitoimipaikka}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-sm">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: vari }}
              aria-hidden
            />
            {label}
          </span>
        </div>

        {/* Edistymä */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Edistymä</span>
            <span className="font-semibold text-foreground">
              {alue.edistyma} %
            </span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-white shadow-inner">
            <div
              className="h-full rounded-full"
              style={{ width: `${alue.edistyma}%`, backgroundColor: vari }}
            />
          </div>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
          <Clock className="h-4 w-4 shrink-0" />
          {alue.viimeisinTapahtuma}
        </p>
      </div>

      {/* Hoitoalueen havainnot */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Hoitoalueen havainnot
          </h3>
          <span className="text-xs text-muted">{havainnot.length} kpl</span>
        </div>

        {havainnot.length > 0 ? (
          havainnot.map((h) => (
            <HavaintoKortti key={h.id} havainto={h} naytaAlue={false} />
          ))
        ) : (
          <p className="metal-card rounded-2xl p-4 text-sm text-muted">
            Ei havaintoja tällä hoitoalueella.
          </p>
        )}

        <button
          type="button"
          onClick={onUusiHavainto}
          className="btn-primary flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-primary-foreground transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Plus className="h-5 w-5" strokeWidth={2.25} />
          <span className="text-base font-semibold">Uusi havainto</span>
        </button>
      </div>
    </div>
  );
}
