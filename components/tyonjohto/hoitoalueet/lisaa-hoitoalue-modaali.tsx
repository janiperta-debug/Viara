"use client";

import { useEffect, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { Check, LoaderCircle, MapPin, Minus, Plus, Search, X } from "lucide-react";
import { haeHoitoalueKohteet, haeOsoiteEhdotukset, luoHoitoalue, paivitaHoitoalue } from "@/app/actions/hoitoalueet";
import type { MmlHoitoalueKohde, MmlOsoiteKohde } from "@/lib/mml-kiinteisto";

type Asiakkuus = { id: string; nimi: string };
type Muokattava = {
  id: string;
  nimi: string;
  osoite: string;
  kiinteistotunnus: string | null;
  asiakkuusId: string;
  rajaGeoJson: MmlHoitoalueKohde["rajaGeoJson"];
  lasnaoloalueMetrit: number;
};
type Props = { asiakkuudet: Asiakkuus[]; muokattava?: Muokattava | null; onClose: () => void; onSaved: () => void };

const LASNAOLOALUE_MIN = -50;
const LASNAOLOALUE_MAX = 50;

const MmlHoitoalueEsikatselu = dynamic(
  () => import("./mml-hoitoalue-esikatselu").then((m) => m.MmlHoitoalueEsikatselu),
  { ssr: false, loading: () => <div className="flex h-[320px] items-center justify-center rounded-xl border border-border bg-border/20 text-sm text-muted">Ladataan karttaa…</div> }
);

export function LisaaHoitoalueModaali({ asiakkuudet, muokattava = null, onClose, onSaved }: Props) {
  const [odottaa, startTransition] = useTransition();
  const [hakee, setHakee] = useState(false);
  const [ehdotuksiaLadataan, setEhdotuksiaLadataan] = useState(false);
  const [nimi, setNimi] = useState("");
  const [osoite, setOsoite] = useState("");
  const [kiinteistotunnus, setKiinteistotunnus] = useState("");
  const [asiakkuusId, setAsiakkuusId] = useState(asiakkuudet[0]?.id ?? "");
  const [lasnaoloalueMetrit, setLasnaoloalueMetrit] = useState(0);
  const [kohteet, setKohteet] = useState<MmlHoitoalueKohde[]>([]);
  const [osoiteEhdotukset, setOsoiteEhdotukset] = useState<MmlOsoiteKohde[]>([]);
  const [valittu, setValittu] = useState<MmlHoitoalueKohde | null>(null);
  const [kaytaAlkuperainenRaja, setKaytaAlkuperainenRaja] = useState(Boolean(muokattava));
  const [virhe, setVirhe] = useState<string | null>(null);

  useEffect(() => {
    setNimi(muokattava?.nimi ?? "");
    setOsoite(muokattava?.osoite ?? "");
    setKiinteistotunnus(muokattava?.kiinteistotunnus ?? "");
    setAsiakkuusId(muokattava?.asiakkuusId ?? asiakkuudet[0]?.id ?? "");
    setLasnaoloalueMetrit(muokattava?.lasnaoloalueMetrit ?? 0);
    setKohteet([]);
    setOsoiteEhdotukset([]);
    setValittu(null);
    setKaytaAlkuperainenRaja(Boolean(muokattava?.rajaGeoJson));
    setVirhe(null);
  }, [muokattava, asiakkuudet]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !odottaa && !hakee) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, odottaa, hakee]);

  useEffect(() => {
    const haku = osoite.trim();
    if (haku.length < 3 || kiinteistotunnus.trim()) {
      setOsoiteEhdotukset([]);
      setEhdotuksiaLadataan(false);
      return;
    }

    let peruttu = false;
    const ajastin = window.setTimeout(async () => {
      setEhdotuksiaLadataan(true);
      const tulos = await haeOsoiteEhdotukset(haku);
      if (peruttu) return;
      setEhdotuksiaLadataan(false);
      setOsoiteEhdotukset(tulos.ok ? tulos.kohteet : []);
    }, 300);

    return () => {
      peruttu = true;
      window.clearTimeout(ajastin);
    };
  }, [osoite, kiinteistotunnus]);

  function haeKohde(arvot: { osoite: string; kiinteistotunnus?: string } = { osoite, kiinteistotunnus }) {
    setVirhe(null);
    setKohteet([]);
    setValittu(null);
    setKaytaAlkuperainenRaja(false);
    setOsoiteEhdotukset([]);
    setHakee(true);
    startTransition(async () => {
      const tulos = await haeHoitoalueKohteet(arvot);
      setHakee(false);
      if (!tulos.ok) {
        setVirhe(tulos.virhe);
        return;
      }
      setKohteet(tulos.kohteet);
      if (tulos.kohteet.length === 1) setValittu(tulos.kohteet[0]);
    });
  }

  function valitseOsoite(kohde: MmlOsoiteKohde) {
    setOsoite(kohde.osoite);
    setKiinteistotunnus(kohde.kiinteistotunnus ?? "");
    if (!muokattava && !nimi.trim()) setNimi(kohde.osoite);
    setKaytaAlkuperainenRaja(false);
    setOsoiteEhdotukset([]);
    haeKohde({ osoite: kohde.osoite, kiinteistotunnus: kohde.kiinteistotunnus ?? "" });
  }

  function valitseKohde(kohde: MmlHoitoalueKohde) {
    setValittu(kohde);
    setKaytaAlkuperainenRaja(false);
    if (kohde.kiinteistotunnus) setKiinteistotunnus(kohde.kiinteistotunnus);
    if (kohde.osoite) {
      setOsoite(kohde.osoite);
      if (!muokattava && !nimi.trim()) setNimi(kohde.osoite);
    }
  }

  const rajaGeoJson: MmlHoitoalueKohde["rajaGeoJson"] | null = valittu?.rajaGeoJson ?? (kaytaAlkuperainenRaja ? muokattava?.rajaGeoJson ?? null : null);

  function muutaLasnaoloaluetta(delta: number) {
    setLasnaoloalueMetrit((arvo) => Math.max(LASNAOLOALUE_MIN, Math.min(LASNAOLOALUE_MAX, arvo + delta)));
  }

  function tallenna() {
    if (!rajaGeoJson) return;
    setVirhe(null);
    startTransition(async () => {
      const input = {
        nimi,
        osoite,
        kiinteistotunnus: valittu?.kiinteistotunnus ?? kiinteistotunnus,
        asiakkuusId,
        rajaGeoJson,
        lasnaoloalueMetrit,
      };
      const tulos = muokattava
        ? await paivitaHoitoalue(muokattava.id, input)
        : await luoHoitoalue(input);
      if (!tulos.ok) {
        setVirhe(tulos.virhe);
        return;
      }
      onSaved();
    });
  }

  const osoitehakuAuki = osoite.trim().length >= 3 && !kiinteistotunnus.trim() && (osoiteEhdotukset.length > 0 || ehdotuksiaLadataan);
  const muokkaus = Boolean(muokattava);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto p-4" role="dialog" aria-modal="true" aria-labelledby="lisaa-hoitoalue-otsikko">
      <button type="button" aria-label="Sulje" onClick={onClose} disabled={odottaa || hakee} className="absolute inset-0 z-0 bg-foreground/40 backdrop-blur-sm" />
      <div className="metal-card relative z-10 my-4 w-full max-w-2xl rounded-2xl p-6">
        <div className="relative z-20 flex items-start justify-between gap-4 bg-inherit">
          <div>
            <h2 id="lisaa-hoitoalue-otsikko" className="text-lg font-semibold text-foreground">{muokkaus ? "Muokkaa hoitoaluetta" : "Lisää hoitoalue"}</h2>
            <p className="mt-1 text-sm text-muted">Etsi kohde osoitteella tai kiinteistötunnuksella. Viara hakee virallisen kiinteistörajan Maanmittauslaitokselta.</p>
          </div>
          <button type="button" onClick={onClose} disabled={odottaa || hakee} aria-label="Sulje" className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-white/60 hover:text-foreground disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>

        {asiakkuudet.length === 0 ? (
          <div className="mt-5 rounded-xl border border-accent/30 bg-accent/5 px-4 py-4 text-sm text-muted">Luo ensin vähintään yksi asiakkuus. Hoitoaluetta ei voi luoda ilman asiakkuutta.</div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="relative z-30 space-y-4">
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-foreground">Asiakkuus</span><select value={asiakkuusId} onChange={(e) => setAsiakkuusId(e.target.value)} className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">{asiakkuudet.map((a) => <option key={a.id} value={a.id}>{a.nimi}</option>)}</select></label>
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-foreground">Hoitoalueen nimi <span className="font-normal text-muted">{muokkaus ? "(pakollinen)" : "(esitäytetään osoitteella)"}</span></span><input value={nimi} onChange={(e) => setNimi(e.target.value)} maxLength={200} placeholder="Esim. As Oy Mäntyrinne" className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>

              <div className="relative rounded-2xl border border-border bg-white/60 p-4">
                <div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-foreground">Etsi kiinteistö</p><p className="mt-0.5 text-xs text-muted">Kirjoita osoitetta ja valitse Maanmittauslaitoksen ehdotuksesta. Kiinteistötunnuksella voit tehdä tarkan haun.</p></div><Search className="h-4 w-4 text-primary" /></div>
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <label className="block"><span className="mb-1.5 block text-xs font-medium text-muted">Osoite</span><input value={osoite} onChange={(e) => { setOsoite(e.target.value); setKiinteistotunnus(""); setValittu(null); setKohteet([]); setKaytaAlkuperainenRaja(false); setVirhe(null); }} maxLength={200} placeholder="Keskuskatu 12, 05800 Hyvinkää" autoComplete="off" className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
                  <label className="block"><span className="mb-1.5 block text-xs font-medium text-muted">Kiinteistötunnus <span className="font-normal">(valinnainen)</span></span><input value={kiinteistotunnus} onChange={(e) => { setKiinteistotunnus(e.target.value); setValittu(null); setKaytaAlkuperainenRaja(false); }} maxLength={200} placeholder="106-1-2-3" className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
                  <button type="button" onClick={() => haeKohde()} disabled={hakee || odottaa || (!osoite.trim() && !kiinteistotunnus.trim())} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60">{hakee ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Hae</button>
                </div>

                {osoitehakuAuki && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
                    {ehdotuksiaLadataan && <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted"><LoaderCircle className="h-4 w-4 animate-spin" /> Haetaan osoitteita…</div>}
                    {osoiteEhdotukset.map((kohde) => (
                      <button key={kohde.id} type="button" onMouseDown={(e) => { e.preventDefault(); valitseOsoite(kohde); }} className="flex w-full items-start gap-3 border-t border-border px-4 py-3.5 text-left transition first:border-t-0 hover:bg-primary/5">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="min-w-0"><span className="block text-sm font-medium text-foreground">{kohde.osoite}</span>{kohde.kiinteistotunnus && <span className="mt-0.5 block text-xs text-muted">Kiinteistötunnus: {kohde.kiinteistotunnus}</span>}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {kohteet.length > 1 && <div className="space-y-2"> <p className="text-sm font-medium text-foreground">Valitse löydetyistä kohteista</p>{kohteet.map((kohde) => <button key={kohde.id} type="button" onClick={() => valitseKohde(kohde)} className={`w-full rounded-xl border px-4 py-3 text-left transition ${valittu?.id === kohde.id ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/40"}`}><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium text-foreground">{kohde.osoite || "Kiinteistö"}</p><p className="mt-1 text-xs text-muted">Kiinteistötunnus: {kohde.kiinteistotunnus ?? "Ei tunnusta"}</p></div>{valittu?.id === kohde.id && <Check className="h-5 w-5 shrink-0 text-primary" />}</div></button>)}</div>}
            </div>

            {rajaGeoJson && <div className="relative z-0 isolate space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Kiinteistörajan esikatselu</p>
                  <p className="text-xs text-muted">Virallinen Maanmittauslaitoksen raja säilyy muuttumattomana.</p>
                </div>
              </div>
              <MmlHoitoalueEsikatselu geometry={rajaGeoJson} />

              <div className="rounded-2xl border border-border bg-white/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Läsnäoloalue</p>
                    <p className="mt-1 text-xs leading-5 text-muted">Säädä GPS:n sallittua heittoa hoitoalueen rajaan nähden. Positiivinen arvo laajentaa aluetta ja negatiivinen arvo kutistaa sitä.</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xl font-semibold tabular-nums text-foreground">{lasnaoloalueMetrit > 0 ? "+" : ""}{lasnaoloalueMetrit} m</p>
                    <p className="text-[11px] text-muted">oletus 0 m</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button type="button" onClick={() => muutaLasnaoloaluetta(-1)} disabled={lasnaoloalueMetrit <= LASNAOLOALUE_MIN || odottaa} aria-label="Pienennä läsnäoloaluetta yhdellä metrillä" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-foreground hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"><Minus className="h-4 w-4" /></button>
                  <input type="range" min={LASNAOLOALUE_MIN} max={LASNAOLOALUE_MAX} step={1} value={lasnaoloalueMetrit} onChange={(e) => setLasnaoloalueMetrit(Number(e.target.value))} aria-label="Läsnäoloalue metreinä" className="min-w-0 flex-1 accent-primary" />
                  <button type="button" onClick={() => muutaLasnaoloaluetta(1)} disabled={lasnaoloalueMetrit >= LASNAOLOALUE_MAX || odottaa} aria-label="Kasvata läsnäoloaluetta yhdellä metrillä" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-foreground hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-4 w-4" /></button>
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-muted"><span>{LASNAOLOALUE_MIN} m</span><span>0 m</span><span>+{LASNAOLOALUE_MAX} m</span></div>
              </div>
            </div>}

            {virhe && <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{virhe}</div>}

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} disabled={odottaa || hakee} className="min-h-11 rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50">Peruuta</button>
              <button type="button" onClick={tallenna} disabled={odottaa || hakee || !nimi.trim() || !asiakkuusId || !rajaGeoJson} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">{odottaa ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {muokkaus ? "Tallenna muutokset" : "Hyväksy ja tallenna hoitoalue"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
