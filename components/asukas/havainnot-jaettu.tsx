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
  Camera,
} from "lucide-react";
import type { AsiakasHavainto, AsiakasHavaintoStatus } from "@/lib/asiakas-havainnot";

export const TYYPPI_IKONI: Record<AsiakasHavainto["tyyppi"], typeof Snowflake> = {
  liukkaus: Snowflake,
  auraus: Truck,
  hiekoitus: Sparkles,
  vaurio: Wrench,
  muu: AlertCircle,
};

const TYYPPI_LABEL: Record<AsiakasHavainto["tyyppi"], string> = {
  liukkaus: "Liukkaus",
  auraus: "Auraus",
  hiekoitus: "Hiekoitus",
  vaurio: "Vaurio",
  muu: "Muu havainto",
};

const STATUS_MAARITTEET: Record<AsiakasHavaintoStatus, { label: string; vari: string }> = {
  avoin: { label: "Avoin", vari: "#c0392b" },
  tyon_alla: { label: "Työn alla", vari: "#d97706" },
  valmis: { label: "Valmis", vari: "#16a34a" },
  suljettu: { label: "Suljettu", vari: "#6b7280" },
};

export function StatusMerkki({ status }: { status: AsiakasHavaintoStatus }) {
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

export function HavaintoKortti({ havainto }: { havainto: AsiakasHavainto }) {
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
        <p className="truncate text-base font-semibold text-foreground">
          {havainto.otsikko}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-sm text-muted">
          <span>{havainto.aika}</span>
          <span aria-hidden>·</span>
          <span className="truncate">{havainto.tekija}</span>
        </p>
        <p className="mt-1.5 text-sm text-foreground/70">{havainto.kuvaus}</p>
        <div className="mt-2">
          <StatusMerkki status={havainto.status} />
        </div>
      </div>
    </div>
  );
}

const TYYPPI_VALINNAT: AsiakasHavainto["tyyppi"][] = [
  "liukkaus",
  "auraus",
  "hiekoitus",
  "vaurio",
  "muu",
];

export function TeeHavaintoModaali({
  onClose,
  hoitoalueNimi,
}: {
  onClose: () => void;
  hoitoalueNimi: string;
}) {
  const [tyyppi, setTyyppi] = useState<AsiakasHavainto["tyyppi"] | null>(null);
  const [kuva, setKuva] = useState(false);
  const [lahetetty, setLahetetty] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Tee havainto"
      onClick={onClose}
    >
      <div
        className="metal-card max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-3xl sm:pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-5">
          <h2 className="text-lg font-bold text-foreground">Tee havainto</h2>
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
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="h-7 w-7" strokeWidth={2.5} />
            </span>
            <p className="text-base font-semibold text-foreground">
              Kiitos, havainto lähetetty
            </p>
            <p className="max-w-xs text-sm text-muted">
              Havainto näkyy nyt kaikille hoitoalueella {hoitoalueNimi} ja
              huoltoyhtiö saa siitä tiedon.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-primary mt-2 flex h-11 items-center justify-center rounded-2xl px-6 text-primary-foreground"
            >
              <span className="text-sm font-semibold">Valmis</span>
            </button>
          </div>
        ) : (
          <div className="px-5 pt-4">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Hoitoalue
              </p>
              <p className="text-base font-medium text-foreground">
                {hoitoalueNimi}
              </p>
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted">
              1 · Havainnon tyyppi
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
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
                    <span className="text-sm font-medium">{TYYPPI_LABEL[t]}</span>
                  </button>
                );
              })}
            </div>

            <label className="mt-5 block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                2 · Kuvaus
              </span>
              <textarea
                rows={3}
                placeholder="Kerro lyhyesti mitä havaitsit…"
                className="mt-2 w-full resize-none rounded-2xl bg-white p-4 text-base text-foreground shadow-sm outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-primary"
              />
            </label>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted">
              3 · Valokuva (valinnainen)
            </p>
            <button
              type="button"
              onClick={() => setKuva((k) => !k)}
              className={`mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 shadow-sm transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                kuva ? "bg-primary/10 text-primary" : "bg-white text-foreground"
              }`}
            >
              {kuva ? (
                <>
                  <Check className="h-5 w-5" strokeWidth={2.25} />
                  <span className="text-sm font-medium">Kuva lisätty</span>
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5" strokeWidth={1.75} />
                  <span className="text-sm font-medium">Lisää kuva</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setLahetetty(true)}
              disabled={!tyyppi}
              className="btn-primary mt-6 flex h-14 w-full items-center justify-center rounded-2xl px-5 text-primary-foreground transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              <span className="text-base font-semibold">Lähetä havainto</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
