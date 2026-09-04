"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, Database, ExternalLink, LoaderCircle, Pencil, Users } from "lucide-react";
import { paivitaAdminOrganisaatio, type AdminOrganisaatio } from "@/app/actions/admin";

type Palaute = { tyyppi: "onnistui" | "virhe"; viesti: string } | null;
function Palauteviesti({ palaute }: { palaute: Palaute }) { if (!palaute) return null; return <p role={palaute.tyyppi === "virhe" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${palaute.tyyppi === "onnistui" ? "border-primary/25 bg-primary/10 text-primary" : "border-destructive/25 bg-destructive/10 text-destructive"}`}>{palaute.viesti}</p>; }

export function AdminYllapito({ organisaatiot }: { organisaatiot: AdminOrganisaatio[] }) {
  const router = useRouter();
  const [odottaa, startTransition] = useTransition();
  const [muokattavaId, setMuokattavaId] = useState<string | null>(null);
  const [nimi, setNimi] = useState("");
  const [palaute, setPalaute] = useState<Palaute>(null);
  function aloitaMuokkaus(o: AdminOrganisaatio) { setMuokattavaId(o.id); setNimi(o.nimi); setPalaute(null); }
  function tallenna() { if (!muokattavaId) return; setPalaute(null); startTransition(async () => { const tulos = await paivitaAdminOrganisaatio(muokattavaId, nimi); if (!tulos.ok) return setPalaute({ tyyppi: "virhe", viesti: tulos.virhe }); setMuokattavaId(null); setNimi(""); setPalaute({ tyyppi: "onnistui", viesti: "Organisaation nimi päivitettiin." }); router.refresh(); }); }
  const yhteensaKayttajat = organisaatiot.reduce((s, o) => s + o.kayttajia, 0);
  const yhteensaAsiakkuudet = organisaatiot.reduce((s, o) => s + o.asiakkuuksia, 0);
  const yhteensaHoitoalueet = organisaatiot.reduce((s, o) => s + o.hoitoalueita, 0);
  const kortit = [{ label: "Organisaatiot", value: organisaatiot.length, icon: Building2 }, { label: "Käyttäjät", value: yhteensaKayttajat, icon: Users }, { label: "Asiakkuudet", value: yhteensaAsiakkuudet, icon: Building2 }, { label: "Hoitoalueet", value: yhteensaHoitoalueet, icon: Database }];
  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{kortit.map(({ label, value, icon: Icon }) => <section key={label} className="metal-card rounded-2xl p-5"><div className="flex items-center justify-between"><span className="text-sm font-medium text-muted">{label}</span><Icon className="h-5 w-5 text-primary" /></div><p className="mt-3 text-3xl font-semibold text-foreground">{value}</p></section>)}</div>
    <section className="metal-card overflow-hidden rounded-2xl"><div className="border-b border-border/60 px-5 py-5"><h2 className="text-base font-semibold text-foreground">Organisaatiot</h2><p className="mt-1 text-sm text-muted">Viara-alustan organisaatiot ja niiden tämänhetkinen sisältö.</p></div>
      {organisaatiot.length === 0 ? <div className="px-5 py-10 text-center"><Building2 className="mx-auto h-8 w-8 text-muted/60" /><p className="mt-3 text-sm font-medium text-foreground">Organisaatioita ei vielä ole.</p></div> : <ul className="divide-y divide-border/60">{organisaatiot.map((o) => { const muokkaa = muokattavaId === o.id; return <li key={o.id} className="px-5 py-4">{muokkaa ? <div className="flex flex-col gap-3 sm:flex-row sm:items-end"><label className="min-w-0 flex-1"><span className="mb-1.5 block text-xs font-medium text-muted">Organisaation nimi</span><input value={nimi} onChange={(e) => setNimi(e.target.value)} maxLength={200} autoFocus className="w-full rounded-xl border border-primary bg-white px-3.5 py-2.5 text-sm text-foreground outline-none ring-2 ring-primary/10" /></label><div className="flex gap-2"><button type="button" onClick={tallenna} disabled={odottaa} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">{odottaa ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Tallenna</button><button type="button" onClick={() => setMuokattavaId(null)} disabled={odottaa} className="inline-flex min-h-10 items-center rounded-xl border border-border bg-white px-3.5 py-2 text-sm font-semibold text-muted">Peruuta</button></div></div> : <div className="flex flex-col gap-4 lg:flex-row lg:items-center"><div className="flex min-w-0 flex-1 items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{o.nimi}</p><p className="mt-1 text-xs text-muted">{o.kayttajia} käyttäjää · {o.asiakkuuksia} asiakkuutta · {o.hoitoalueita} hoitoaluetta</p></div></div><div className="flex gap-2"><button type="button" onClick={() => aloitaMuokkaus(o)} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-muted hover:text-foreground"><Pencil className="h-4 w-4" /> Muokkaa</button><a href={`/admin/organisaatiot/${o.id}`} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"><ExternalLink className="h-4 w-4" /> Avaa</a></div></div>}</li>; })}</ul>}
    </section><Palauteviesti palaute={palaute} />
  </div>;
}
