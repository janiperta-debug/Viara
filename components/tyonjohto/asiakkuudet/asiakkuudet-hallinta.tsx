"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, LoaderCircle, Pencil, Plus, UserPlus, Users } from "lucide-react";
import { luoAsiakkuus, paivitaAsiakkuus } from "@/app/actions/asiakkuudet";
import { luoAsiakkuudenKayttaja } from "@/app/actions/kayttajat";

type Asiakkuus = { id: string; nimi: string };
type AsiakasKayttaja = { id: string; nimi: string; email: string | null; asiakkuus_id: string };
type Palaute = { tyyppi: "onnistui" | "virhe"; viesti: string } | null;

function Palauteviesti({ palaute }: { palaute: Palaute }) {
  if (!palaute) return null;
  return <p role={palaute.tyyppi === "virhe" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${palaute.tyyppi === "onnistui" ? "border-primary/25 bg-primary/10 text-primary" : "border-destructive/25 bg-destructive/10 text-destructive"}`}>{palaute.viesti}</p>;
}

export function AsiakkuudetHallinta({ organisaationNimi, asiakkuudet, asiakasKayttajat }: { organisaationNimi: string; asiakkuudet: Asiakkuus[]; asiakasKayttajat: AsiakasKayttaja[] }) {
  const router = useRouter();
  const [odottaa, startTransition] = useTransition();
  const [uusiNimi, setUusiNimi] = useState("");
  const [muokattavaId, setMuokattavaId] = useState<string | null>(null);
  const [muokattavaNimi, setMuokattavaNimi] = useState("");
  const [uusiKayttajaAsiakkuusId, setUusiKayttajaAsiakkuusId] = useState<string | null>(null);
  const [kayttajaNimi, setKayttajaNimi] = useState("");
  const [kayttajaEmail, setKayttajaEmail] = useState("");
  const [kayttajaSalasana, setKayttajaSalasana] = useState("");
  const [palaute, setPalaute] = useState<Palaute>(null);

  function lisaa() {
    setPalaute(null);
    startTransition(async () => {
      const tulos = await luoAsiakkuus(uusiNimi);
      if (!tulos.ok) return setPalaute({ tyyppi: "virhe", viesti: tulos.virhe });
      setUusiNimi("");
      setPalaute({ tyyppi: "onnistui", viesti: "Asiakkuus luotiin." });
      router.refresh();
    });
  }

  function aloitaMuokkaus(asiakkuus: Asiakkuus) {
    setPalaute(null); setMuokattavaId(asiakkuus.id); setMuokattavaNimi(asiakkuus.nimi);
  }

  function tallennaMuutos() {
    if (!muokattavaId) return;
    setPalaute(null);
    startTransition(async () => {
      const tulos = await paivitaAsiakkuus(muokattavaId, muokattavaNimi);
      if (!tulos.ok) return setPalaute({ tyyppi: "virhe", viesti: tulos.virhe });
      setMuokattavaId(null); setMuokattavaNimi("");
      setPalaute({ tyyppi: "onnistui", viesti: "Asiakkuuden nimi päivitettiin." });
      router.refresh();
    });
  }

  function luoKayttaja(asiakkuusId: string) {
    setPalaute(null);
    startTransition(async () => {
      const tulos = await luoAsiakkuudenKayttaja({ asiakkuusId, nimi: kayttajaNimi, email: kayttajaEmail, salasana: kayttajaSalasana });
      if (!tulos.ok) return setPalaute({ tyyppi: "virhe", viesti: tulos.virhe });
      setKayttajaNimi(""); setKayttajaEmail(""); setKayttajaSalasana(""); setUusiKayttajaAsiakkuusId(null);
      setPalaute({ tyyppi: "onnistui", viesti: "Asiakaskäyttäjä luotiin. Hän voi nyt kirjautua Viaraan." });
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.75fr)]">
      <section className="metal-card overflow-hidden rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-5">
          <div><div className="flex items-center gap-2 text-primary"><Building2 className="h-5 w-5" /><h2 className="text-base font-semibold text-foreground">Asiakkuudet</h2></div><p className="mt-1 text-sm text-muted">{organisaationNimi}</p></div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted shadow-sm">{asiakkuudet.length} asiakkuutta</span>
        </div>
        {asiakkuudet.length === 0 ? (
          <div className="px-5 py-10 text-center"><Building2 className="mx-auto h-8 w-8 text-muted/60" /><p className="mt-3 text-sm font-medium text-foreground">Organisaatiossa ei vielä ole asiakkuuksia.</p><p className="mt-1 text-sm text-muted">Luo ensimmäinen asiakkuus oikealla olevalla lomakkeella.</p></div>
        ) : (
          <ul className="divide-y divide-border/60">
            {asiakkuudet.map((asiakkuus) => {
              const muokkaa = muokattavaId === asiakkuus.id;
              const kayttajat = asiakasKayttajat.filter((k) => k.asiakkuus_id === asiakkuus.id);
              const lomakeAuki = uusiKayttajaAsiakkuusId === asiakkuus.id;
              return <li key={asiakkuus.id} className="px-5 py-4">
                {muokkaa ? <div className="flex flex-col gap-3 sm:flex-row sm:items-end"><label className="block min-w-0 flex-1"><span className="mb-1.5 block text-xs font-medium text-muted">Asiakkuuden nimi</span><input value={muokattavaNimi} onChange={(e) => setMuokattavaNimi(e.target.value)} autoFocus maxLength={200} className="w-full rounded-xl border border-primary bg-white px-3.5 py-2.5 text-sm text-foreground outline-none ring-2 ring-primary/10" /></label><div className="flex gap-2"><button type="button" onClick={tallennaMuutos} disabled={odottaa} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">{odottaa ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Tallenna</button><button type="button" onClick={() => setMuokattavaId(null)} disabled={odottaa} className="inline-flex min-h-10 items-center rounded-xl border border-border bg-white px-3.5 py-2 text-sm font-semibold text-muted">Peruuta</button></div></div> : <div>
                  <div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{asiakkuus.nimi}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-muted"><Users className="h-3.5 w-3.5" />{kayttajat.length} asiakaskäyttäjää</p></div><button type="button" onClick={() => aloitaMuokkaus(asiakkuus)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-muted hover:text-foreground"><Pencil className="h-4 w-4" />Muokkaa</button></div>
                  <div className="mt-4 rounded-xl bg-muted/10 p-4">
                    {kayttajat.length > 0 && <div className="mb-3 space-y-2">{kayttajat.map((k) => <div key={k.id} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2"><Users className="h-4 w-4 text-muted" /><div><p className="text-sm font-medium text-foreground">{k.nimi}</p><p className="text-xs text-muted">Asiakas</p></div></div>)}</div>}
                    {lomakeAuki ? <div className="space-y-3"><p className="text-sm font-semibold text-foreground">Uusi asiakaskäyttäjä</p><input value={kayttajaNimi} onChange={(e) => setKayttajaNimi(e.target.value)} placeholder="Nimi" maxLength={200} className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground" /><input value={kayttajaEmail} onChange={(e) => setKayttajaEmail(e.target.value)} placeholder="Sähköposti" type="email" autoComplete="off" className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground" /><input value={kayttajaSalasana} onChange={(e) => setKayttajaSalasana(e.target.value)} placeholder="Salasana (vähintään 8 merkkiä)" type="password" autoComplete="new-password" className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground" /><div className="flex gap-2"><button type="button" onClick={() => luoKayttaja(asiakkuus.id)} disabled={odottaa || !kayttajaNimi.trim() || !kayttajaEmail.trim() || kayttajaSalasana.length < 8} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">{odottaa ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Luo käyttäjä</button><button type="button" onClick={() => setUusiKayttajaAsiakkuusId(null)} disabled={odottaa} className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-muted">Peruuta</button></div></div> : <button type="button" onClick={() => { setPalaute(null); setUusiKayttajaAsiakkuusId(asiakkuus.id); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-2 text-sm font-semibold text-foreground hover:border-primary"><UserPlus className="h-4 w-4 text-primary" />Lisää asiakaskäyttäjä</button>}
                  </div>
                </div>}
              </li>;
            })}
          </ul>
        )}
      </section>
      <section className="metal-card h-fit rounded-2xl p-5"><div className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /><h2 className="text-base font-semibold text-foreground">Uusi asiakkuus</h2></div><p className="mt-1 text-sm leading-6 text-muted">Asiakkuus kuuluu aina tähän organisaatioon. Sen alle liitetään hoitoalueet ja asiakaskäyttäjät.</p><label className="mt-4 block" htmlFor="uusi-asiakkuus"><span className="mb-1.5 block text-sm font-medium text-foreground">Asiakkuuden nimi</span><input id="uusi-asiakkuus" value={uusiNimi} onChange={(e) => setUusiNimi(e.target.value)} maxLength={200} placeholder="Esim. L&T Hämeenlinna" className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" /></label><Palauteviesti palaute={palaute} /><button type="button" onClick={lisaa} disabled={odottaa || !uusiNimi.trim()} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-60">{odottaa ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Luo asiakkuus</button></section>
    </div>
  );
}
