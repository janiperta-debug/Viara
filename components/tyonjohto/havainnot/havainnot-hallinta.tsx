"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, TriangleAlert, X } from "lucide-react";
import { paivitaHavaintoTila } from "@/app/actions/havainnot";
import type { TyonjohtoHavainto, TyonjohtoHavaintoTila } from "@/lib/tyonjohto-havainnot";

const TILAT: { key: "kaikki" | TyonjohtoHavaintoTila; label: string }[] = [
  { key: "kaikki", label: "Kaikki" },
  { key: "avoin", label: "Avoin" },
  { key: "tyon_alla", label: "Työn alla" },
  { key: "valmis", label: "Valmis" },
  { key: "suljettu", label: "Suljettu" },
];

const TILA_LABELIT: Record<TyonjohtoHavaintoTila, string> = {
  avoin: "Avoin",
  tyon_alla: "Työn alla",
  valmis: "Valmis",
  suljettu: "Suljettu",
};

export function HavainnotHallinta({ havainnot }: { havainnot: TyonjohtoHavainto[] }) {
  const [suodatin, setSuodatin] = useState<"kaikki" | TyonjohtoHavaintoTila>("kaikki");
  const [haku, setHaku] = useState("");
  const [valittu, setValittu] = useState<TyonjohtoHavainto | null>(null);

  const nakyvat = useMemo(() => {
    const q = haku.trim().toLowerCase();
    return havainnot.filter((h) => {
      const tilaOk = suodatin === "kaikki" || h.tila === suodatin;
      const hakuOk = !q || `${h.otsikko} ${h.hoitoalueNimi} ${h.tekija} ${h.kuvaus}`.toLowerCase().includes(q);
      return tilaOk && hakuOk;
    });
  }, [havainnot, haku, suodatin]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Havainnot</h1>
          <p className="text-sm text-muted">Kentältä ja asiakkailta tulleet havainnot</p>
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

      <div className="flex flex-wrap gap-2">
        {TILAT.map(({ key, label }) => {
          const aktiivinen = suodatin === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSuodatin(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${aktiivinen ? "bg-primary text-primary-foreground" : "metal-card text-muted hover:text-foreground"}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="metal-card overflow-hidden rounded-2xl">
        <div className="hidden grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-4 border-b border-border/70 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted md:grid">
          <span>Havainto</span><span>Hoitoalue</span><span>Tekijä</span><span>Aika</span><span>Tila</span>
        </div>
        <ul>
          {nakyvat.map((h) => (
            <li key={h.id} className="border-b border-border/60 last:border-0">
              <button
                type="button"
                onClick={() => setValittu(h)}
                className="grid w-full grid-cols-1 gap-1 px-5 py-4 text-left hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr] md:items-center md:gap-4"
              >
                <span className="flex items-center gap-2.5">
                  {h.tila === "avoin" && <TriangleAlert className="h-4 w-4 shrink-0 text-destructive" />}
                  <span className="font-medium text-foreground">{h.otsikko}</span>
                </span>
                <span className="text-sm text-muted md:text-foreground">{h.hoitoalueNimi}</span>
                <span className="text-sm text-muted">{h.tekija}</span>
                <span className="text-sm tabular-nums text-muted">{h.aika}</span>
                <TilaMerkki tila={h.tila} />
              </button>
            </li>
          ))}
        </ul>
        {nakyvat.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted">Ei havaintoja valituilla suodattimilla.</p>}
      </div>

      {valittu && <HavaintoDialog havainto={valittu} onClose={() => setValittu(null)} />}
    </div>
  );
}

function TilaMerkki({ tila }: { tila: TyonjohtoHavaintoTila }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
      <span className="text-foreground">{TILA_LABELIT[tila]}</span>
    </span>
  );
}

function HavaintoDialog({ havainto, onClose }: { havainto: TyonjohtoHavainto; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [virhe, setVirhe] = useState<string | null>(null);

  const seuraava = havainto.tila === "avoin"
    ? { tila: "tyon_alla" as const, label: "Ota työn alle" }
    : havainto.tila === "tyon_alla"
      ? { tila: "valmis" as const, label: "Merkitse valmiiksi" }
      : havainto.tila === "valmis"
        ? { tila: "suljettu" as const, label: "Sulje havainto" }
        : null;

  function suorita() {
    if (!seuraava) return;
    setVirhe(null);
    startTransition(async () => {
      const tulos = await paivitaHavaintoTila({ havaintoId: havainto.id, tila: seuraava.tila });
      if (!tulos.ok) {
        setVirhe(tulos.virhe);
        return;
      }
      onClose();
      window.location.reload();
    });
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="metal-card max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl pb-5 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 px-5 pt-5">
          <h2 className="text-lg font-bold text-foreground">{havainto.otsikko}</h2>
          <button type="button" onClick={onClose} aria-label="Sulje" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-muted shadow-sm"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between gap-3">
            <TilaMerkki tila={havainto.tila} />
            {havainto.vastuuhenkilo && <span className="text-sm text-muted">Käsittelijä: {havainto.vastuuhenkilo}</span>}
          </div>
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm leading-relaxed text-foreground">{havainto.kuvaus || "Ei kuvausta."}</p>
            <p className="mt-3 text-sm text-muted">{havainto.hoitoalueNimi}{havainto.hoitoalueOsoite ? ` · ${havainto.hoitoalueOsoite}` : ""}</p>
            <p className="mt-1 text-xs text-muted">{havainto.tekija} · {havainto.tekijaRooli} · {havainto.aika}</p>
          </div>
          {virhe && <p className="mt-3 text-sm text-destructive">{virhe}</p>}
          {seuraava && (
            <button type="button" disabled={isPending} onClick={suorita} className="btn-primary mt-5 flex h-12 w-full items-center justify-center rounded-2xl px-5 text-primary-foreground disabled:opacity-60">
              {isPending ? "Tallennetaan…" : seuraava.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
