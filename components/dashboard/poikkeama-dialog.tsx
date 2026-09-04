"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { luoPoikkeama } from "@/app/actions/poikkeamat";

export function PoikkeamaDialog({ hoitoalue }: { hoitoalue: { id: string; nimi: string } | null }) {
  const [auki, setAuki] = useState(false);
  const [kuvaus, setKuvaus] = useState("");
  const [lahetetaan, setLahetetaan] = useState(false);
  const [virhe, setVirhe] = useState<string | null>(null);
  const [onnistui, setOnnistui] = useState(false);

  async function laheta() {
    if (!hoitoalue || !kuvaus.trim()) return;
    setLahetetaan(true); setVirhe(null);
    const tulos = await luoPoikkeama({ hoitoalueId: hoitoalue.id, kuvaus });
    setLahetetaan(false);
    if (!tulos.ok) { setVirhe(tulos.virhe); return; }
    setOnnistui(true);
  }

  function sulje() { setAuki(false); setKuvaus(""); setVirhe(null); setOnnistui(false); }

  return <>
    <button type="button" onClick={() => setAuki(true)} disabled={!hoitoalue} className="metal-card flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 md:p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-foreground shadow-sm"><AlertTriangle className="h-6 w-6" strokeWidth={1.75} /></span>
      <span className="flex-1"><span className="block text-base font-semibold text-foreground">Ilmoita poikkeamasta</span><span className="mt-0.5 block text-xs text-muted">{hoitoalue ? hoitoalue.nimi : "Ei aktiivista hoitoaluetta"}</span></span>
    </button>

    {auki && <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Ilmoita poikkeamasta" onClick={sulje}>
      <div className="metal-card w-full max-w-lg rounded-t-3xl p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-foreground">Ilmoita poikkeamasta</h2><p className="mt-0.5 text-sm text-muted">{hoitoalue?.nimi}</p></div><button type="button" onClick={sulje} aria-label="Sulje" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-muted shadow-sm"><X className="h-5 w-5" /></button></div>
        {onnistui ? <div className="py-8 text-center"><p className="text-base font-semibold text-foreground">Poikkeama ilmoitettu</p><p className="mt-1 text-sm text-muted">Ilmoitus on nyt työnjohdon tiedossa.</p><button type="button" onClick={sulje} className="btn-primary mt-5 h-11 rounded-2xl px-6 text-sm font-semibold text-primary-foreground">Sulje</button></div> : <><label className="mt-5 block"><span className="text-xs font-semibold uppercase tracking-wider text-muted">Kuvaus</span><textarea value={kuvaus} onChange={(e) => setKuvaus(e.target.value)} rows={4} maxLength={2000} placeholder="Mikä estää tai muuttaa työn toteutusta?" className="mt-2 w-full resize-none rounded-2xl bg-white p-4 text-base text-foreground shadow-sm outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-primary" /></label>{virhe && <p role="alert" className="mt-3 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{virhe}</p>}<button type="button" onClick={laheta} disabled={!kuvaus.trim() || lahetetaan || !hoitoalue} className="btn-primary mt-5 flex h-12 w-full items-center justify-center rounded-2xl px-5 text-primary-foreground disabled:opacity-50">{lahetetaan ? "Lähetetään…" : "Ilmoita poikkeamasta"}</button></>}
      </div>
    </div>}
  </>;
}
