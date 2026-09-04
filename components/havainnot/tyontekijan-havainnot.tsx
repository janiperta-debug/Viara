"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronRight, Search, TriangleAlert, X } from "lucide-react";
import { paivitaHavaintoTila } from "@/app/actions/havainnot";
import type { TyonjohtoHavainto, TyonjohtoHavaintoTila } from "@/lib/tyonjohto-havainnot";

const TILAT: { key: "kaikki" | TyonjohtoHavaintoTila; label: string }[] = [
  { key: "kaikki", label: "Kaikki" },
  { key: "avoin", label: "Avoin" },
  { key: "tyon_alla", label: "Työn alla" },
  { key: "valmis", label: "Valmis" },
];

const LABELIT: Record<TyonjohtoHavaintoTila, string> = {
  avoin: "Avoin",
  tyon_alla: "Työn alla",
  valmis: "Valmis",
  suljettu: "Suljettu",
};

export function TyontekijanHavainnot({ havainnot }: { havainnot: TyonjohtoHavainto[] }) {
  const [suodatin, setSuodatin] = useState<"kaikki" | TyonjohtoHavaintoTila>("avoin");
  const [haku, setHaku] = useState("");
  const [valittu, setValittu] = useState<TyonjohtoHavainto | null>(null);

  const nakyvat = useMemo(() => {
    const q = haku.trim().toLowerCase();
    return havainnot.filter((h) => {
      const tilaOk = suodatin === "kaikki" || h.tila === suodatin;
      const hakuOk = !q || `${h.otsikko} ${h.hoitoalueNimi} ${h.kuvaus}`.toLowerCase().includes(q);
      return tilaOk && hakuOk;
    });
  }, [havainnot, haku, suodatin]);

  return (
    <>
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Havainnot</h1>
          <p className="mt-1 text-sm text-muted">Organisaation avoimet ja käsitellyt havainnot</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={haku} onChange={(e) => setHaku(e.target.value)} placeholder="Hae havaintoa…" aria-label="Hae havaintoa" className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {TILAT.map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setSuodatin(key)} className={`rounded-full px-4 py-1.5 text-sm font-medium ${suodatin === key ? "bg-primary text-primary-foreground" : "metal-card text-muted"}`}>
            {label}
          </button>
        ))}
      </div>

      <section aria-label="Havainnot" className="flex flex-col gap-3">
        {nakyvat.map((havainto) => (
          <button key={havainto.id} type="button" onClick={() => setValittu(havainto)} className="metal-card flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
              {havainto.tila === "avoin" ? <TriangleAlert className="h-6 w-6" strokeWidth={1.75} /> : <span className="text-sm font-bold">{havainto.tyyppi.slice(0, 1).toUpperCase()}</span>}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-base font-semibold text-foreground">{havainto.otsikko}</span>
              </span>
              <span className="mt-0.5 block truncate text-sm text-muted">{havainto.hoitoalueNimi} · {havainto.aika}</span>
              <span className="mt-1 block text-xs font-medium text-muted">{LABELIT[havainto.tila]}{havainto.vastuuhenkilo ? ` · ${havainto.vastuuhenkilo}` : ""}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
          </button>
        ))}
        {nakyvat.length === 0 && <p className="py-10 text-center text-sm text-muted">Ei havaintoja valituilla suodattimilla.</p>}
      </section>

      {valittu && <HavaintoDialog havainto={valittu} onClose={() => setValittu(null)} />}
    </>
  );
}

function HavaintoDialog({ havainto, onClose }: { havainto: TyonjohtoHavainto; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [virhe, setVirhe] = useState<string | null>(null);
  const seuraava = havainto.tila === "avoin" ? { tila: "tyon_alla" as const, label: "Ota työn alle" } : havainto.tila === "tyon_alla" ? { tila: "valmis" as const, label: "Merkitse valmiiksi" } : null;

  function suorita() {
    if (!seuraava) return;
    setVirhe(null);
    startTransition(async () => {
      const tulos = await paivitaHavaintoTila({ havaintoId: havainto.id, tila: seuraava.tila });
      if (!tulos.ok) { setVirhe(tulos.virhe); return; }
      onClose();
      window.location.reload();
    });
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-foreground/40 sm:items-center sm:p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="metal-card max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl p-5 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">{havainto.otsikko}</h2>
          <button type="button" onClick={onClose} aria-label="Sulje" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-muted shadow-sm"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm leading-relaxed text-foreground">{havainto.kuvaus || "Ei kuvausta."}</p>
          <p className="mt-3 text-sm text-muted">{havainto.hoitoalueNimi}{havainto.hoitoalueOsoite ? ` · ${havainto.hoitoalueOsoite}` : ""}</p>
          <p className="mt-1 text-xs text-muted">Ilmoittaja: {havainto.tekija} · {havainto.tekijaRooli}</p>
          <p className="mt-1 text-xs text-muted">Tila: {LABELIT[havainto.tila]}{havainto.vastuuhenkilo ? ` · Käsittelijä: ${havainto.vastuuhenkilo}` : ""}</p>
        </div>
        {virhe && <p className="mt-3 text-sm text-destructive">{virhe}</p>}
        {seuraava && <button type="button" disabled={isPending} onClick={suorita} className="btn-primary mt-5 flex h-12 w-full items-center justify-center rounded-2xl px-5 text-primary-foreground disabled:opacity-60">{isPending ? "Tallennetaan…" : seuraava.label}</button>}
      </div>
    </div>
  );
}
