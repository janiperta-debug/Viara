"use client";

import { useEffect, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { X, MapPin, LoaderCircle, Save, RotateCcw } from "lucide-react";
import { luoHoitoalue } from "@/app/actions/hoitoalueet";
import type { RajaPiste } from "./hoitoalue-raja-kartta";

const HoitoalueRajaKartta = dynamic(
  () => import("./hoitoalue-raja-kartta").then((m) => m.HoitoalueRajaKartta),
  { ssr: false, loading: () => <div className="flex h-[320px] items-center justify-center rounded-xl border border-border bg-border/20 text-sm text-muted">Ladataan karttaa…</div> }
);

type Asiakkuus = { id: string; nimi: string };

type Props = {
  asiakkuudet: Asiakkuus[];
  onClose: () => void;
  onSaved: () => void;
};

export function LisaaHoitoalueModaali({ asiakkuudet, onClose, onSaved }: Props) {
  const [odottaa, startTransition] = useTransition();
  const [nimi, setNimi] = useState("");
  const [osoite, setOsoite] = useState("");
  const [kiinteistotunnus, setKiinteistotunnus] = useState("");
  const [asiakkuusId, setAsiakkuusId] = useState(asiakkuudet[0]?.id ?? "");
  const [rajaPisteet, setRajaPisteet] = useState<RajaPiste[]>([]);
  const [virhe, setVirhe] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !odottaa) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, odottaa]);

  function tallenna() {
    setVirhe(null);
    startTransition(async () => {
      const tulos = await luoHoitoalue({ nimi, osoite, kiinteistotunnus, asiakkuusId, rajaPisteet });
      if (!tulos.ok) {
        setVirhe(tulos.virhe);
        return;
      }
      onSaved();
    });
  }

  function tyhjennaRaja() {
    setRajaPisteet([]);
    setVirhe(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4" role="dialog" aria-modal="true" aria-labelledby="lisaa-hoitoalue-otsikko">
      <button type="button" aria-label="Sulje" onClick={onClose} disabled={odottaa} className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
      <div className="metal-card relative z-10 my-4 w-full max-w-2xl rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="lisaa-hoitoalue-otsikko" className="text-lg font-semibold text-foreground">Lisää hoitoalue</h2>
            <p className="mt-1 text-sm text-muted">Täytä perustiedot ja piirrä hoitoalueen todellinen työskentelyraja kartalle.</p>
          </div>
          <button type="button" onClick={onClose} disabled={odottaa} aria-label="Sulje" className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-white/60 hover:text-foreground disabled:opacity-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        {asiakkuudet.length === 0 ? (
          <div className="mt-5 rounded-xl border border-accent/30 bg-accent/5 px-4 py-4 text-sm text-muted">
            Luo ensin vähintään yksi asiakkuus. Hoitoaluetta ei voi luoda ilman asiakkuutta.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">Asiakkuus</span>
              <select value={asiakkuusId} onChange={(e) => setAsiakkuusId(e.target.value)} className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                {asiakkuudet.map((a) => <option key={a.id} value={a.id}>{a.nimi}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">Hoitoalueen nimi</span>
              <input value={nimi} onChange={(e) => setNimi(e.target.value)} maxLength={200} placeholder="Esim. As Oy Mäntyrinne" className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">Osoite</span>
              <input value={osoite} onChange={(e) => setOsoite(e.target.value)} maxLength={200} placeholder="Keskuskatu 12, 05800 Hyvinkää" className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">Kiinteistötunnus <span className="font-normal text-muted">(valinnainen)</span></span>
              <input value={kiinteistotunnus} onChange={(e) => setKiinteistotunnus(e.target.value)} maxLength={200} placeholder="Esim. 106-1-2-3" className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </label>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Hoitoalueen raja</p>
                  <p className="mt-0.5 text-xs text-muted">Lisää kartalle vähintään kolme pistettä alueen ympärille.</p>
                </div>
                {rajaPisteet.length > 0 && (
                  <button type="button" onClick={tyhjennaRaja} disabled={odottaa} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-white disabled:opacity-50">
                    <RotateCcw className="h-3.5 w-3.5" /> Tyhjennä
                  </button>
                )}
              </div>
              <HoitoalueRajaKartta pisteet={rajaPisteet} onMuuta={setRajaPisteet} />
              <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {rajaPisteet.length < 3 ? `${rajaPisteet.length}/3 rajapistettä` : `${rajaPisteet.length} rajapistettä · alue voidaan tallentaa`}
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs leading-5 text-muted">
              Raja tallennetaan GeoJSON-polygona. Samaa rajaa käytetään myöhemmin GPS:n perusteella hoitoalueen tunnistamiseen, joten rajauksen kannattaa seurata todellista työskentelyaluetta.
            </div>
            {virhe && <p role="alert" className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">{virhe}</p>}
            <button type="button" onClick={tallenna} disabled={odottaa || !nimi.trim() || !osoite.trim() || !asiakkuusId || rajaPisteet.length < 3} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60">
              {odottaa ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Tallenna hoitoalue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
