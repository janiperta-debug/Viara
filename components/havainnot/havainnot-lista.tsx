"use client";

import { useState } from "react";
import {
  Snowflake,
  Lightbulb,
  Signpost,
  AlertCircle,
  ChevronRight,
  Plus,
  X,
  MapPin,
  Clock,
} from "lucide-react";
import {
  HAVAINNOT,
  HAVAINTO_YHTEENVETO,
  STATUS_MAARITTEET,
  type Havainto,
  type HavaintoTyyppi,
  type HavaintoStatus,
} from "@/lib/havainnot-mock";

const TYYPPI_IKONI: Record<HavaintoTyyppi, typeof Snowflake> = {
  liukkaus: Snowflake,
  katuvalo: Lightbulb,
  liikennemerkki: Signpost,
  muu: AlertCircle,
};

// Kullekin statukselle sopiva seuraava toimenpide (esitystaso).
const STATUS_TOIMINTO: Record<HavaintoStatus, string | null> = {
  uusi: "Ota vastaan",
  kasittelyssa: "Merkitse valmiiksi",
  kasitelty: "Sulje havainto",
};

function StatusMerkki({ status }: { status: HavaintoStatus }) {
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

export function HavainnotLista() {
  const [valittu, setValittu] = useState<Havainto | null>(null);
  const [uusiAuki, setUusiAuki] = useState(false);

  return (
    <>
      {/* Yhteenveto */}
      <section aria-label="Yhteenveto" className="flex flex-wrap gap-2">
        <div className="metal-card flex items-center gap-2 rounded-full px-3.5 py-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: STATUS_MAARITTEET.uusi.vari }}
            aria-hidden
          />
          <span className="text-sm font-semibold text-foreground">
            {HAVAINTO_YHTEENVETO.vaatiiHuomiota}
          </span>
          <span className="text-sm text-muted">vaatii huomiota</span>
        </div>
        <div className="metal-card flex items-center gap-2 rounded-full px-3.5 py-2">
          <span className="text-sm font-semibold text-foreground">
            {HAVAINTO_YHTEENVETO.tanaan}
          </span>
          <span className="text-sm text-muted">havaintoa tänään</span>
        </div>
      </section>

      {/* Havaintolista */}
      <section aria-label="Havainnot" className="flex flex-col gap-3">
        {HAVAINNOT.map((havainto) => {
          const Ikoni = TYYPPI_IKONI[havainto.tyyppi];
          const { vari } = STATUS_MAARITTEET[havainto.status];
          return (
            <button
              key={havainto.id}
              type="button"
              onClick={() => setValittu(havainto)}
              className="metal-card flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span
                className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-foreground shadow-sm"
                style={{ color: vari }}
              >
                <Ikoni className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-base font-semibold text-foreground">
                    {havainto.otsikko}
                  </span>
                  {havainto.vakavuus === "korkea" && (
                    <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
                      Kiireellinen
                    </span>
                  )}
                </span>
                <span className="mt-0.5 flex items-center gap-2 text-sm text-muted">
                  <span className="truncate">{havainto.sijainti}</span>
                  <span aria-hidden>·</span>
                  <span className="shrink-0">{havainto.aika}</span>
                </span>
                <span className="mt-1.5 block">
                  <StatusMerkki status={havainto.status} />
                </span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
            </button>
          );
        })}
      </section>

      {/* Uusi havainto -päätoiminto */}
      <button
        type="button"
        onClick={() => setUusiAuki(true)}
        className="btn-primary sticky bottom-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 text-primary-foreground transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Plus className="h-5 w-5" strokeWidth={2.25} />
        <span className="text-base font-semibold">Uusi havainto</span>
      </button>

      {/* Detaljinäkymä */}
      {valittu && (
        <HavaintoDetalji havainto={valittu} onClose={() => setValittu(null)} />
      )}

      {/* Uuden havainnon UI-flow */}
      {uusiAuki && <UusiHavainto onClose={() => setUusiAuki(false)} />}
    </>
  );
}

function ModaaliKuori({
  otsikko,
  onClose,
  children,
}: {
  otsikko: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={otsikko}
      onClick={onClose}
    >
      <div
        className="metal-card max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-3xl sm:pb-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-5">
          <h2 className="text-lg font-bold text-foreground">{otsikko}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Sulje"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-muted shadow-sm transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 pt-4">{children}</div>
      </div>
    </div>
  );
}

function HavaintoDetalji({
  havainto,
  onClose,
}: {
  havainto: Havainto;
  onClose: () => void;
}) {
  const Ikoni = TYYPPI_IKONI[havainto.tyyppi];
  const { label, vari } = STATUS_MAARITTEET[havainto.status];
  const toiminto = STATUS_TOIMINTO[havainto.status];

  return (
    <ModaaliKuori otsikko={havainto.otsikko} onClose={onClose}>
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm"
          style={{ color: vari }}
        >
          <Ikoni className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: vari }}
            aria-hidden
          />
          {label}
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-foreground/80">
        {havainto.kuvaus}
      </p>

      <dl className="mt-4 flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 shrink-0 text-muted" />
          <dt className="sr-only">Sijainti</dt>
          <dd className="text-foreground">{havainto.sijainti}</dd>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 shrink-0 text-muted" />
          <dt className="sr-only">Aika</dt>
          <dd className="text-foreground">Havaittu klo {havainto.aika}</dd>
        </div>
      </dl>

      {toiminto && (
        <button
          type="button"
          className="btn-primary mt-5 flex h-12 w-full items-center justify-center rounded-2xl px-5 text-primary-foreground transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <span className="text-base font-semibold">{toiminto}</span>
        </button>
      )}
    </ModaaliKuori>
  );
}

const TYYPPI_VALINNAT: { tyyppi: HavaintoTyyppi; label: string }[] = [
  { tyyppi: "liukkaus", label: "Liukkaus" },
  { tyyppi: "katuvalo", label: "Katuvalo" },
  { tyyppi: "liikennemerkki", label: "Liikennemerkki" },
  { tyyppi: "muu", label: "Muu" },
];

function UusiHavainto({ onClose }: { onClose: () => void }) {
  const [tyyppi, setTyyppi] = useState<HavaintoTyyppi | null>(null);

  return (
    <ModaaliKuori otsikko="Uusi havainto" onClose={onClose}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        Havainnon tyyppi
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {TYYPPI_VALINNAT.map(({ tyyppi: t, label }) => {
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
              <span className="text-sm font-medium">{label}</span>
            </button>
          );
        })}
      </div>

      <label className="mt-5 block">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Sijainti
        </span>
        <input
          type="text"
          placeholder="Kohde tai osoite"
          className="mt-2 h-12 w-full rounded-2xl bg-white px-4 text-base text-foreground shadow-sm outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-primary"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Lisätieto
        </span>
        <textarea
          rows={3}
          placeholder="Kerro tarkemmin…"
          className="mt-2 w-full resize-none rounded-2xl bg-white p-4 text-base text-foreground shadow-sm outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-primary"
        />
      </label>

      <button
        type="button"
        onClick={onClose}
        className="btn-primary mt-5 flex h-12 w-full items-center justify-center rounded-2xl px-5 text-primary-foreground transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <span className="text-base font-semibold">Lähetä havainto</span>
      </button>
    </ModaaliKuori>
  );
}
