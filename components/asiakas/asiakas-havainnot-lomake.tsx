"use client";

import { useState } from "react";
import { AlertCircle, Check, ChevronDown, Snowflake, Sparkles, Truck, Wrench, X } from "lucide-react";
import { luoAsiakasHavainto } from "@/app/actions/havainnot";
import type { AsiakasAlue } from "@/lib/asiakas-data";
import type { AsiakasHavaintoTyyppi } from "@/lib/asiakas-havainnot";

const TYYPIT: { value: AsiakasHavaintoTyyppi; label: string; icon: typeof Snowflake }[] = [
  { value: "liukkaus", label: "Liukkaus", icon: Snowflake },
  { value: "auraus", label: "Auraus", icon: Truck },
  { value: "hiekoitus", label: "Hiekoitus", icon: Sparkles },
  { value: "vaurio", label: "Vaurio", icon: Wrench },
  { value: "muu", label: "Muu", icon: AlertCircle },
];

export function UusiAsiakasHavainto({ alueet, onClose }: { alueet: AsiakasAlue[]; onClose: () => void }) {
  const [alueId, setAlueId] = useState(alueet[0]?.id ?? "");
  const [tyyppi, setTyyppi] = useState<AsiakasHavaintoTyyppi | null>(null);
  const [kuvaus, setKuvaus] = useState("");
  const [lahetetaan, setLahetetaan] = useState(false);
  const [onnistui, setOnnistui] = useState(false);
  const [virhe, setVirhe] = useState<string | null>(null);

  async function laheta() {
    if (!tyyppi || !kuvaus.trim() || !alueId) return;
    setLahetetaan(true);
    setVirhe(null);
    const tulos = await luoAsiakasHavainto({ hoitoalueId: alueId, tyyppi, kuvaus });
    setLahetetaan(false);
    if (!tulos.ok) {
      setVirhe(tulos.virhe);
      return;
    }
    setOnnistui(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Uusi havainto" onClick={onClose}>
      <div className="metal-card max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-3xl sm:pb-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 px-6 pt-6">
          <h2 className="text-lg font-bold text-foreground">Uusi havainto</h2>
          <button type="button" onClick={onClose} aria-label="Sulje" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-muted shadow-sm"><X className="h-5 w-5" /></button>
        </div>

        {onnistui ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"><Check className="h-7 w-7" strokeWidth={2.5} /></span>
            <p className="text-base font-semibold text-foreground">Havainto lähetetty</p>
            <p className="max-w-xs text-sm text-muted">Havainto on nyt avoin ja näkyy hoitoalueen muille käyttäjille.</p>
            <button type="button" onClick={onClose} className="btn-primary mt-2 h-11 rounded-2xl px-6 text-sm font-semibold text-primary-foreground">Sulje</button>
          </div>
        ) : (
          <div className="px-6 pt-5">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Hoitoalue</span>
              <div className="relative mt-2">
                <select value={alueId} onChange={(e) => setAlueId(e.target.value)} className="h-12 w-full appearance-none rounded-2xl bg-white px-4 pr-10 text-base text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  {alueet.map((alue) => <option key={alue.id} value={alue.id}>{alue.nimi}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              </div>
            </label>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted">Tyyppi</p>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {TYYPIT.map(({ value, label, icon: Ikoni }) => {
                const valittu = tyyppi === value;
                return <button key={value} type="button" onClick={() => setTyyppi(value)} aria-pressed={valittu} className={`flex items-center gap-2.5 rounded-2xl p-3.5 text-left shadow-sm transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${valittu ? "bg-primary text-primary-foreground" : "bg-white text-foreground"}`}><Ikoni className="h-5 w-5 shrink-0" strokeWidth={1.75} /><span className="text-sm font-medium">{label}</span></button>;
              })}
            </div>

            <label className="mt-5 block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Kuvaus</span>
              <textarea value={kuvaus} onChange={(e) => setKuvaus(e.target.value)} rows={4} maxLength={2000} placeholder="Kerro tarkemmin havainnosta…" className="mt-2 w-full resize-none rounded-2xl bg-white p-4 text-base text-foreground shadow-sm outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-primary" />
              <span className="mt-1 block text-right text-xs text-muted">{kuvaus.length}/2000</span>
            </label>

            {virhe && <p role="alert" className="mt-3 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{virhe}</p>}
            <button type="button" onClick={laheta} disabled={!tyyppi || !kuvaus.trim() || lahetetaan || !alueId} className="btn-primary mt-5 flex h-12 w-full items-center justify-center rounded-2xl px-5 text-primary-foreground disabled:opacity-50"><span className="text-base font-semibold">{lahetetaan ? "Lähetetään…" : "Lähetä havainto"}</span></button>
          </div>
        )}
      </div>
    </div>
  );
}
