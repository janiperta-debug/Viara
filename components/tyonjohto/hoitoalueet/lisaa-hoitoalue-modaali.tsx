"use client";

import { useEffect, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { Check, LoaderCircle, MapPin, Search, X } from "lucide-react";
import { haeHoitoalueKohteet, luoHoitoalue } from "@/app/actions/hoitoalueet";
import type { MmlHoitoalueKohde } from "@/lib/mml-kiinteisto";

const MmlHoitoalueEsikatselu = dynamic(
  () => import("./mml-hoitoalue-esikatselu").then((m) => m.MmlHoitoalueEsikatselu),
  { ssr: false, loading: () => <div className="flex h-[320px] items-center justify-center rounded-xl border border-border bg-border/20 text-sm text-muted">Ladataan karttaa…</div> }
);

type Asiakkuus = { id: string; nimi: string };
type Props = { asiakkuudet: Asiakkuus[]; onClose: () => void; onSaved: () => void };

export function LisaaHoitoalueModaali({ asiakkuudet, onClose, onSaved }: Props) {
  const [odottaa, startTransition] = useTransition();
  const [hakee, setHakee] = useState(false);
  const [nimi, setNimi] = useState("");
  const [osoite, setOsoite] = useState("");
  const [kiinteistotunnus, setKiinteistotunnus] = useState("");
  const [asiakkuusId, setAsiakkuusId] = useState(asiakkuudet[0]?.id ?? "");
  const [kohteet, setKohteet] = useState<MmlHoitoalueKohde[]>([]);
  const [valittu, setValittu] = useState<MmlHoitoalueKohde | null>(null);
  const [virhe, setVirhe] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !odottaa && !hakee) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, odottaa, hakee]);

  function haeKohde() {
    setVirhe(null);
    setKohteet([]);
    setValittu(null);
    setHakee(true);
    startTransition(async () => {
      const tulos = await haeHoitoalueKohteet({ osoite, kiinteistotunnus });
      setHakee(false);
      if (!tulos.ok) {
        setVirhe(tulos.virhe);
        return;
      }
      setKohteet(tulos.kohteet);
      if (tulos.kohteet.length === 1) setValittu(tulos.kohteet[0]);
    });
  }

  function valitseKohde(kohde: MmlHoitoalueKohde) {
    setValittu(kohde);
    if (kohde.kiinteistotunnus) setKiinteistotunnus(kohde.kiinteistotunnus);
    if (kohde.osoite) setOsoite(kohde.osoite);
  }

  function tallenna() {
    if (!valittu?.rajaGeoJson) return;
    setVirhe(null);
    startTransition(async () => {
      const tulos = await luoHoitoalue({
        nimi,
        osoite,
        kiinteistotunnus: valittu.kiinteistotunnus ?? kiinteistotunnus,
        asiakkuusId,
        rajaGeoJson: valittu.rajaGeoJson,
      });
      if (!tulos.ok) {
        setVirhe(tulos.virhe);
        return;
      }
      onSaved();
    });
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto p-4" role="dialog" aria-modal="true" aria-labelledby="lisaa-hoitoalue-otsikko">
      <button type="button" aria-label="Sulje" onClick={onClose} disabled={odottaa || hakee} className="absolute inset-0 z-0 bg-foreground/40 backdrop-blur-sm" />
      <div className="metal-card relative z-10 my-4 w-full max-w-2xl overflow-hidden rounded-2xl p-6">
        <div className="relative z-20 flex items-start justify-between gap-4 bg-inherit">
          <div>
            <h2 id="lisaa-hoitoalue-otsikko" className="text-lg font-semibold text-foreground">Lisää hoitoalue</h2>
            <p className="mt-1 text-sm text-muted">Etsi kohde osoitteella tai kiinteistötunnuksella. Viara hakee virallisen kiinteistörajan Maanmittauslaitokselta.</p>
          </div>
          <button type="button" onClick={onClose} disabled={odottaa || hakee} aria-label="Sulje" className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-white/60 hover:text-foreground disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>

        {asiakkuudet.length === 0 ? (
          <div className="mt-5 rounded-xl border border-accent/30 bg-accent/5 px-4 py-4 text-sm text-muted">Luo ensin vähintään yksi asiakkuus. Hoitoaluetta ei voi luoda ilman asiakkuutta.</div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="relative z-10 space-y-4">
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-foreground">Asiakkuus</span><select value={asiakkuusId} onChange={(e) => setAsiakkuusId(e.target.value)} className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">{asiakkuudet.map((a) => <option key={a.id} value={a.id}>{a.nimi}</option>)}</select></label>
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-foreground">Hoitoalueen nimi</span><input value={nimi} onChange={(e) => setNimi(e.target.value)} maxLength={200} placeholder="Esim. As Oy Mäntyrinne" className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>

              <div className="rounded-2xl border border-border bg-white/60 p-4">
                <div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-foreground">Etsi kiinteistö</p><p className="mt-0.5 text-xs text-muted">Osoite on helpoin tapa. Kiinteistötunnuksella voit tehdä tarkan haun.</p></div><Search className="h-4 w-4 text-primary" /></div>
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <label className="block"><span className="mb-1.5 block text-xs font-medium text-muted">Osoite</span><input value={osoite} onChange={(e) => { setOsoite(e.target.value); setValittu(null); }} maxLength={200} placeholder="Keskuskatu 12, 05800 Hyvinkää" className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
                  <label className="block"><span className="mb-1.5 block text-xs font-medium text-muted">Kiinteistötunnus <span className="font-normal">(valinnainen)</span></span><input value={kiinteistotunnus} onChange={(e) => { setKiinteistotunnus(e.target.value); setValittu(null); }} maxLength={200} placeholder="106-1-2-3" className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
                  <button type="button" onClick={haeKohde} disabled={hakee || odottaa || (!osoite.trim() && !kiinteistotunnus.trim())} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60">{hakee ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Hae</button>
                </div>
              </div>

              {kohteet.length > 1 && <div className="space-y-2"> <p className="text-sm font-medium text-foreground">Valitse löydetyistä kohteista</p>{kohteet.map((kohde) => <button key={kohde.id} type="button" onClick={() => valitseKohde(kohde)} className={`w-full rounded-xl border px-4 py-3 text-left transition ${valittu?.id === kohde.id ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/40"}`}><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium text-foreground">{kohde.osoite || "Kiinteistö"}</p><p className="mt-1 text-xs text-muted">Kiinteistötunnus: {kohde.kiinteistotunnus ?? "Ei tunnusta"}</p></div>{valittu?.id === kohde.id && <Check className="h-5 w-5 shrink-0 text-primary" />}</div></button>)}</div>}
            </div>

            {valittu?.rajaGeoJson && <div className="relative z-0 isolate space-y-2"><div className="relative z-10 flex items-center gap-2 bg-inherit text-sm font-medium text-foreground"><MapPin className="h-4 w-4 text-primary" /> Kiinteistörajan esikatselu</div><div className="relative z-0 isolate overflow-hidden rounded-xl"><MmlHoitoalueEsikatselu geometry={valittu.rajaGeoJson} /></div><div className="relative z-10 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs leading-5 text-muted"><span className="font-medium text-foreground">MML:n kiinteistöraja.</span> Tarkista kartalta, että löydetty kohde vastaa hoidettavaa aluetta. Hyväksytty raja tallennetaan Viaran hoitoalueen GeoJSON-rajaukseksi.</div></div>}

            {virhe && <p role="alert" className="relative z-20 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">{virhe}</p>}
            <button type="button" onClick={tallenna} disabled={odottaa || hakee || !nimi.trim() || !asiakkuusId || !valittu?.rajaGeoJson} className="relative z-20 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60">{odottaa ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Hyväksy ja tallenna hoitoalue</button>
          </div>
        )}
      </div>
    </div>
  );
}
