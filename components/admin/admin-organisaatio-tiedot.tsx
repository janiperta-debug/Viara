"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, Database, LoaderCircle, Pencil, Users } from "lucide-react";
import { paivitaAdminOrganisaatio } from "@/app/actions/admin";

type Kayttaja = { id: string; nimi: string; rooli: string; asiakkuusId: string | null };
type Asiakkuus = { id: string; nimi: string };
type Hoitoalue = { id: string; nimi: string; osoite: string | null; asiakkuusId: string };

export function AdminOrganisaatioTiedot({
  organisaatioId,
  organisaationNimi,
  kayttajat,
  asiakkuudet,
  hoitoalueet,
}: {
  organisaatioId: string;
  organisaationNimi: string;
  kayttajat: Kayttaja[];
  asiakkuudet: Asiakkuus[];
  hoitoalueet: Hoitoalue[];
}) {
  const router = useRouter();
  const [muokkaa, setMuokkaa] = useState(false);
  const [nimi, setNimi] = useState(organisaationNimi);
  const [palaute, setPalaute] = useState<string | null>(null);
  const [odottaa, startTransition] = useTransition();

  function tallenna() {
    setPalaute(null);
    startTransition(async () => {
      const tulos = await paivitaAdminOrganisaatio(organisaatioId, nimi);
      if (!tulos.ok) {
        setPalaute(tulos.virhe);
        return;
      }
      setMuokkaa(false);
      setPalaute("Organisaation nimi päivitettiin.");
      router.refresh();
    });
  }

  const rooliLabel = (rooli: string) =>
    rooli === "tyonjohto" ? "Työnjohto" : rooli === "kuljettaja" ? "Kuljettaja" : rooli === "asiakas" ? "Asiakas" : rooli;

  return (
    <div className="space-y-6">
      <section className="metal-card rounded-2xl p-5">
        {muokkaa ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1">
              <span className="mb-1.5 block text-xs font-medium text-muted">Organisaation nimi</span>
              <input value={nimi} onChange={(e) => setNimi(e.target.value)} maxLength={200} autoFocus className="w-full rounded-xl border border-primary bg-white px-3.5 py-2.5 text-sm text-foreground outline-none ring-2 ring-primary/10" />
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={tallenna} disabled={odottaa} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                {odottaa ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Tallenna
              </button>
              <button type="button" onClick={() => { setMuokkaa(false); setNimi(organisaationNimi); }} disabled={odottaa} className="inline-flex min-h-10 items-center rounded-xl border border-border bg-white px-3.5 py-2 text-sm font-semibold text-muted">Peruuta</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></span>
              <div><p className="text-sm font-semibold text-foreground">{organisaationNimi}</p><p className="mt-1 text-xs text-muted">Organisaation perustiedot</p></div>
            </div>
            <button type="button" onClick={() => { setPalaute(null); setMuokkaa(true); }} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-muted hover:text-foreground"><Pencil className="h-4 w-4" /> Muokkaa nimeä</button>
          </div>
        )}
        {palaute && <p className="mt-4 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-primary">{palaute}</p>}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="metal-card overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-5"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><h2 className="text-base font-semibold text-foreground">Käyttäjät</h2></div><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">{kayttajat.length}</span></div>
          {kayttajat.length === 0 ? <p className="px-5 py-8 text-sm text-muted">Organisaatiossa ei ole käyttäjiä.</p> : <ul className="divide-y divide-border/60">{kayttajat.map((k) => <li key={k.id} className="flex items-center gap-3 px-5 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-muted"><Users className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{k.nimi}</p><p className="text-xs text-muted">{rooliLabel(k.rooli)}</p></div></li>)}</ul>}
        </section>

        <section className="metal-card overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-5"><div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /><h2 className="text-base font-semibold text-foreground">Asiakkuudet</h2></div><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">{asiakkuudet.length}</span></div>
          {asiakkuudet.length === 0 ? <p className="px-5 py-8 text-sm text-muted">Organisaatiolla ei ole asiakkuuksia.</p> : <ul className="divide-y divide-border/60">{asiakkuudet.map((a) => { const alueet = hoitoalueet.filter((h) => h.asiakkuusId === a.id); return <li key={a.id} className="px-5 py-4"><p className="text-sm font-semibold text-foreground">{a.nimi}</p><p className="mt-1 text-xs text-muted">{alueet.length} hoitoaluetta</p></li>; })}</ul>}
        </section>
      </div>

      <section className="metal-card overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-5"><div className="flex items-center gap-2"><Database className="h-5 w-5 text-primary" /><h2 className="text-base font-semibold text-foreground">Hoitoalueet</h2></div><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">{hoitoalueet.length}</span></div>
        {hoitoalueet.length === 0 ? <p className="px-5 py-8 text-sm text-muted">Organisaatiolla ei ole hoitoalueita.</p> : <ul className="divide-y divide-border/60">{hoitoalueet.map((h) => { const asiakkuus = asiakkuudet.find((a) => a.id === h.asiakkuusId); return <li key={h.id} className="px-5 py-4"><p className="text-sm font-semibold text-foreground">{h.nimi}</p><p className="mt-1 text-xs text-muted">{asiakkuus?.nimi ?? "Tuntematon asiakkuus"}{h.osoite ? ` · ${h.osoite}` : ""}</p></li>; })}</ul>}
      </section>
    </div>
  );
}
