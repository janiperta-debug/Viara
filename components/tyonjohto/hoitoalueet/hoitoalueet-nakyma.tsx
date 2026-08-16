"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Search,
  Plus,
  MapPin,
  User,
  Clock,
  TriangleAlert,
  Truck,
  Snowflake,
} from "lucide-react";
import {
  HOITOALUEET,
  HOITOALUE_TILAT,
  type HoitoalueTila,
} from "@/lib/tyonjohto-mock";
import { LisaaHoitoalueModaali } from "./lisaa-hoitoalue-modaali";

// Leaflet-kartta vain selaimessa (ei SSR).
const HoitoalueKartta = dynamic(
  () => import("./hoitoalue-kartta").then((m) => m.HoitoalueKartta),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[420px] w-full items-center justify-center rounded-2xl bg-border/40 text-sm text-muted">
        Ladataan karttaa…
      </div>
    ),
  }
);

type Suodatin = "kaikki" | "tyon_alla" | "valmiit" | "havainnot";

const SUODATTIMET: { key: Suodatin; label: string }[] = [
  { key: "kaikki", label: "Kaikki" },
  { key: "tyon_alla", label: "Työn alla" },
  { key: "valmiit", label: "Valmiit" },
  { key: "havainnot", label: "Havainnot" },
];

function TilaPiste({ tila }: { tila: HoitoalueTila }) {
  return (
    <span
      className="h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: HOITOALUE_TILAT[tila].vari }}
      aria-hidden
    />
  );
}

export function HoitoalueetNakyma() {
  const [valittuId, setValittuId] = useState<string>(HOITOALUEET[0].id);
  const [suodatin, setSuodatin] = useState<Suodatin>("kaikki");
  const [haku, setHaku] = useState("");
  const [modaaliAuki, setModaaliAuki] = useState(false);

  const nakyvat = useMemo(() => {
    return HOITOALUEET.filter((a) => {
      const suodatinOk =
        suodatin === "kaikki" ||
        (suodatin === "tyon_alla" && a.tila === "tyon_alla") ||
        (suodatin === "valmiit" && a.tila === "valmis") ||
        (suodatin === "havainnot" && a.havaintojaAvoinna);
      const hakuOk =
        haku.trim() === "" ||
        `${a.nimi} ${a.osoite}`.toLowerCase().includes(haku.toLowerCase());
      return suodatinOk && hakuOk;
    });
  }, [suodatin, haku]);

  const valittu =
    HOITOALUEET.find((a) => a.id === valittuId) ?? HOITOALUEET[0];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Hoitoalueet
          </h1>
          <p className="text-sm text-muted">
            Hallitse hoitoalueita ja niiden sijainteja
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModaaliAuki(true)}
          className="btn-primary flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-5 w-5" strokeWidth={2} />
          Lisää hoitoalue
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr_320px] xl:grid-cols-[360px_1fr_360px]">
        {/* VASEN: lista */}
        <section className="metal-card flex max-h-[640px] flex-col rounded-2xl p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={haku}
              onChange={(e) => setHaku(e.target.value)}
              placeholder="Hae hoitoaluetta…"
              aria-label="Hae hoitoaluetta"
              className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUODATTIMET.map(({ key, label }) => {
              const aktiivinen = suodatin === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSuodatin(key)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    aktiivinen
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-white text-muted hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <ul className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
            {nakyvat.map((a) => {
              const valittuNyt = a.id === valittuId;
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setValittuId(a.id)}
                    aria-current={valittuNyt ? "true" : undefined}
                    className={`w-full rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      valittuNyt
                        ? "border-primary bg-white"
                        : "border-border/60 bg-white/50 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 truncate">
                        <TilaPiste tila={a.tila} />
                        <span className="truncate text-sm font-semibold text-foreground">
                          {a.nimi}
                        </span>
                      </span>
                      <span
                        className="shrink-0 text-xs font-medium"
                        style={{ color: HOITOALUE_TILAT[a.tila].vari }}
                      >
                        {HOITOALUE_TILAT[a.tila].label}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-muted">
                        {a.osoite}
                      </span>
                      <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                        {a.edistyma} %
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${a.edistyma}%`,
                          backgroundColor: HOITOALUE_TILAT[a.tila].vari,
                        }}
                      />
                    </div>
                  </button>
                </li>
              );
            })}
            {nakyvat.length === 0 && (
              <li className="py-8 text-center text-sm text-muted">
                Ei hoitoalueita valituilla suodattimilla.
              </li>
            )}
          </ul>
        </section>

        {/* KESKELLÄ: oikea kartta */}
        <section className="metal-card overflow-hidden rounded-2xl p-2">
          <HoitoalueKartta
            alueet={HOITOALUEET}
            valittuId={valittuId}
            onValitse={setValittuId}
          />
        </section>

        {/* OIKEA: valitun hoitoalueen tiedot */}
        <aside className="metal-card flex max-h-[640px] flex-col overflow-y-auto rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <TilaPiste tila={valittu.tila} />
            <h2 className="text-lg font-semibold text-foreground">
              {valittu.nimi}
            </h2>
          </div>
          <p className="mt-1 flex items-start gap-1.5 text-sm text-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span>
              {valittu.osoite}
              <br />
              {valittu.postitoimipaikka}
            </span>
          </p>

          <div className="mt-4 rounded-xl border border-border/60 bg-white/60 p-3">
            <div className="flex items-center justify-between">
              <span
                className="text-sm font-medium"
                style={{ color: HOITOALUE_TILAT[valittu.tila].vari }}
              >
                {HOITOALUE_TILAT[valittu.tila].label}
              </span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {valittu.edistyma} %
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${valittu.edistyma}%`,
                  backgroundColor: HOITOALUE_TILAT[valittu.tila].vari,
                }}
              />
            </div>
          </div>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted" strokeWidth={1.75} />
              <dt className="text-muted">Kuljettaja:</dt>
              <dd className="font-medium text-foreground">
                {valittu.kuljettaja}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted" strokeWidth={1.75} />
              <dt className="text-muted">Viimeisin:</dt>
              <dd className="font-medium text-foreground">
                {valittu.viimeisinTapahtuma}
              </dd>
            </div>
          </dl>

          {valittu.tyovalineet.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Työvälineet
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {valittu.tyovalineet.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {t === "Aura" ? (
                      <Truck className="h-3.5 w-3.5" strokeWidth={1.75} />
                    ) : (
                      <Snowflake className="h-3.5 w-3.5" strokeWidth={1.75} />
                    )}
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Havainnot
            </h3>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-foreground">
              {valittu.havaintojaAvoinna && (
                <TriangleAlert
                  className="h-4 w-4 text-destructive"
                  strokeWidth={2}
                />
              )}
              {valittu.havainnot}
            </p>
          </div>
        </aside>
      </div>

      {modaaliAuki && (
        <LisaaHoitoalueModaali onClose={() => setModaaliAuki(false)} />
      )}
    </div>
  );
}
