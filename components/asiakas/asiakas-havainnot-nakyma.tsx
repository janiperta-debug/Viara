"use client";

import { useState } from "react";
import { Plus, AlertCircle, CheckCircle2, CircleDot, Snowflake, Sparkles, Truck, Wrench } from "lucide-react";
import { UusiAsiakasHavainto } from "./asiakas-havainnot-lomake";
import type { AsiakasAlue } from "@/lib/asiakas-data";
import type { AsiakasHavainto, AsiakasHavaintoStatus, AsiakasHavaintoTyyppi } from "@/lib/asiakas-havainnot";

const TYYPPI_IKONI: Record<AsiakasHavaintoTyyppi, typeof Snowflake> = {
  liukkaus: Snowflake, auraus: Truck, hiekoitus: Sparkles, vaurio: Wrench, muu: AlertCircle,
};
const STATUS: Record<AsiakasHavaintoStatus, { label: string; className: string }> = {
  avoin: { label: "Avoin", className: "bg-amber-500" },
  tyon_alla: { label: "Työn alla", className: "bg-blue-500" },
  valmis: { label: "Valmis", className: "bg-green-600" },
  suljettu: { label: "Suljettu", className: "bg-slate-500" },
};

export function AsiakasHavainnotNakyma({ havainnot, alueet }: { havainnot: AsiakasHavainto[]; alueet: AsiakasAlue[] }) {
  const [uusiAuki, setUusiAuki] = useState(false);
  const avoimet = havainnot.filter((h) => h.status === "avoin" || h.status === "tyon_alla").length;
  const alueetJoillaHavaintoja = Array.from(new Map(havainnot.map((h) => [h.hoitoalueId, { nimi: h.hoitoalueNimi, osoite: h.hoitoalueOsoite }])).entries());

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-foreground md:text-4xl">Havainnot</h1><p className="mt-1 text-base text-muted">{havainnot.length} havaintoa · {avoimet} avointa</p></div>
        <button type="button" onClick={() => setUusiAuki(true)} disabled={alueet.length === 0} className="btn-primary flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-primary-foreground disabled:opacity-50"><Plus className="h-5 w-5" strokeWidth={2.25} /><span className="text-base font-semibold">Uusi havainto</span></button>
      </header>

      {havainnot.length === 0 ? (
        <div className="metal-card rounded-3xl p-8 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-muted" strokeWidth={1.5} /><h2 className="mt-3 text-lg font-semibold text-foreground">Ei havaintoja</h2><p className="mx-auto mt-1 max-w-md text-sm text-muted">Asiakkuuteesi kuuluvilta hoitoalueilta ei ole vielä kirjattu havaintoja.</p></div>
      ) : (
        <div className="flex flex-col gap-7">
          {alueetJoillaHavaintoja.map(([alueId, alue]) => {
            const alueenHavainnot = havainnot.filter((h) => h.hoitoalueId === alueId);
            return <section key={alueId} aria-label={`${alue.nimi} — havainnot`} className="flex flex-col gap-3"><div className="flex flex-wrap items-end justify-between gap-2 border-b border-border/60 pb-2"><div><h2 className="text-base font-semibold text-foreground">{alue.nimi}</h2>{alue.osoite && <p className="text-sm text-muted">{alue.osoite}</p>}</div><span className="text-sm text-muted">{alueenHavainnot.length} havaintoa</span></div><div className="grid gap-3 lg:grid-cols-2">{alueenHavainnot.map((havainto) => <HavaintoKortti key={havainto.id} havainto={havainto} />)}</div></section>;
          })}
        </div>
      )}
      {uusiAuki && <UusiAsiakasHavainto alueet={alueet} onClose={() => setUusiAuki(false)} />}
    </div>
  );
}

function HavaintoKortti({ havainto }: { havainto: AsiakasHavainto }) {
  const Ikoni = TYYPPI_IKONI[havainto.tyyppi];
  const status = STATUS[havainto.status];
  return <article className="metal-card flex items-start gap-4 rounded-2xl p-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm"><Ikoni className="h-6 w-6" strokeWidth={1.75} /></span><div className="min-w-0 flex-1"><h3 className="truncate text-base font-semibold text-foreground">{havainto.otsikko}</h3><p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted"><span>Ilmoitettu {havainto.aika}</span><span aria-hidden>·</span><span>{havainto.tekijaRooli}</span><span aria-hidden>·</span><span>{havainto.tekija}</span></p>{havainto.kuvaus && <p className="mt-1.5 line-clamp-3 text-sm text-foreground/70">{havainto.kuvaus}</p>}<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted"><span className="flex items-center gap-1.5"><CircleDot className={`h-3 w-3 ${status.className.replace("bg-", "text-")}`} />{status.label}</span>{havainto.kuittausaika && <span>• Kuitattu {havainto.kuittausaika}</span>}{havainto.valmistumisaika && <span>• Valmis {havainto.valmistumisaika}</span>}{havainto.sulkemisaika && <span>• Suljettu {havainto.sulkemisaika}</span>}</div></div></article>;
}
