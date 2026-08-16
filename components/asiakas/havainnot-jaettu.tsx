"use client";

import { useState } from "react";
import {
  Snowflake,
  Truck,
  Sparkles,
  Wrench,
  AlertCircle,
  X,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  STATUS_MAARITTEET,
  TYYPPI_LABEL,
  HOITOALUEET,
  hoitoalueNimi,
  type Havainto,
  type HavaintoStatus,
  type HavaintoTyyppi,
} from "@/lib/asiakas-mock";

export const TYYPPI_IKONI: Record<HavaintoTyyppi, typeof Snowflake> = {
  liukkaus: Snowflake,
  auraus: Truck,
  hiekoitus: Sparkles,
  vaurio: Wrench,
  muu: AlertCircle,
};

export function StatusMerkki({ status }: { status: HavaintoStatus }) {
  const { label, vari } = STATUS_MAARITTEET[status];
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: vari }}
        aria-hidden
      />
      {label}
    </span>
  );
}

// Havaintokortti. naytaAlue=true näyttää hoitoalueen nimen (koko-listassa),
// false kun ollaan jo yhden hoitoalueen kontekstissa.
export function HavaintoKortti({
  havainto,
  naytaAlue = true,
}: {
  havainto: Havainto;
  naytaAlue?: boolean;
}) {
  const Ikoni = TYYPPI_IKONI[havainto.tyyppi];
  const { vari } = STATUS_MAARITTEET[havainto.status];
  return (
    <div className="metal-card flex items-start gap-4 rounded-2xl p-4">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm"
        style={{ color: vari }}
      >
        <Ikoni className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-base font-semibold text-foreground">
            {havainto.otsikko}
          </p>
          {havainto.vakavuus === "kiireellinen" && (
            <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
              Kiireellinen
            </span>
          )}
        </div>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted">
          {naytaAlue && (
            <>
              <span className="truncate font-medium text-foreground/70">
                {hoitoalueNimi(havainto.hoitoalueId)}
              </span>
              <span aria-hidden>·</span>
            </>
          )}
          <span>{havainto.aika}</span>
          <span aria-hidden>·</span>
          <span>{havainto.tekijaRooli}</span>
        </p>
        <p className="mt-1.5 line-clamp-2 text-sm text-foreground/70">
          {havainto.kuvaus}
        </p>
        <div className="mt-2">
          <StatusMerkki status={havainto.status} />
        </div>
      </div>
    </div>
  );
}

const TYYPPI_VALINNAT: HavaintoTyyppi[] = [
  "liukkaus",
  "auraus",
  "hiekoitus",
  "vaurio",
  "muu",
];

// Uuden havainnon modaali. Kohdehoitoalue on AINA eksplisiittinen:
// - lukittuAlueId annettu -> alue on kiinteä (avattu hoitoalueen sisältä)
// - muuten asiakas valitsee minkä tahansa OMISTA hoitoalueistaan
export function UusiHavaintoModaali({
  lukittuAlueId,
  onClose,
}: {
  lukittuAlueId?: string;
  onClose: () => void;
}) {
  const [alueId, setAlueId] = useState(lukittuAlueId ?? HOITOALUEET[0].id);
  const [tyyppi, setTyyppi] = useState<HavaintoTyyppi | null>(null);
  const [lahetetty, setLahetetty] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Uusi havainto"
      onClick={onClose}
    >
      <div
        className="metal-card max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-3xl sm:pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-6 pt-6">
          <h2 className="text-lg font-bold text-foreground">Uusi havainto</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Sulje"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-muted shadow-sm transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {lahetetty ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="h-7 w-7" strokeWidth={2.5} />
            </span>
            <p className="text-base font-semibold text-foreground">
              Havainto lähetetty
            </p>
            <p className="max-w-xs text-sm text-muted">
              Havainto näkyy nyt kaikille, joilla on pääsy hoitoalueeseen{" "}
              {hoitoalueNimi(alueId)}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-primary mt-2 flex h-11 items-center justify-center rounded-2xl px-6 text-primary-foreground"
            >
              <span className="text-sm font-semibold">Sulje</span>
            </button>
          </div>
        ) : (
          <div className="px-6 pt-5">
            {/* Kohdehoitoalue — aina näkyvissä */}
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Hoitoalue
              </span>
              {lukittuAlueId ? (
                <p className="mt-2 rounded-2xl bg-white px-4 py-3 text-base font-medium text-foreground shadow-sm">
                  {hoitoalueNimi(lukittuAlueId)}
                </p>
              ) : (
                <div className="relative mt-2">
                  <select
                    value={alueId}
                    onChange={(e) => setAlueId(e.target.value)}
                    className="h-12 w-full appearance-none rounded-2xl bg-white px-4 pr-10 text-base text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {HOITOALUEET.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nimi}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                </div>
              )}
            </label>

            {/* Tyyppi */}
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted">
              Tyyppi
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {TYYPPI_VALINNAT.map((t) => {
                const Ikoni = TYYPPI_IKONI[t];
                const valittu = tyyppi === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTyyppi(t)}
                    aria-pressed={valittu}
                    className={`flex items-center gap-2.5 rounded-2xl p-3.5 text-left shadow-sm transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      valittu
                        ? "bg-primary text-primary-foreground"
                        : "bg-white text-foreground"
                    }`}
                  >
                    <Ikoni className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                    <span className="text-sm font-medium">
                      {TYYPPI_LABEL[t]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Kuvaus */}
            <label className="mt-5 block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Kuvaus
              </span>
              <textarea
                rows={3}
                placeholder="Kerro tarkemmin havainnosta…"
                className="mt-2 w-full resize-none rounded-2xl bg-white p-4 text-base text-foreground shadow-sm outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-primary"
              />
            </label>

            <button
              type="button"
              onClick={() => setLahetetty(true)}
              disabled={!tyyppi}
              className="btn-primary mt-6 flex h-12 w-full items-center justify-center rounded-2xl px-5 text-primary-foreground transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              <span className="text-base font-semibold">Lähetä havainto</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
