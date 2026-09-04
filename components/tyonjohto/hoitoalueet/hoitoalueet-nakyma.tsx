"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Search, Plus, MapPin, Building2, Pencil } from "lucide-react";
import { LisaaHoitoalueModaali } from "./lisaa-hoitoalue-modaali";

const HoitoalueKartta = dynamic(() => import("./hoitoalue-kartta").then((m) => m.HoitoalueKartta), {
  ssr: false,
  loading: () => <div className="flex h-full min-h-[420px] w-full items-center justify-center rounded-2xl bg-border/40 text-sm text-muted">Ladataan karttaa…</div>,
});

type Asiakkuus = { id: string; nimi: string };
export type HoitoalueRivi = {
  id: string;
  nimi: string;
  osoite: string;
  kiinteistotunnus: string | null;
  asiakkuusId: string;
  asiakkuusNimi: string;
  lat: number | null;
  lng: number | null;
  rajaGeoJson: unknown;
};

type Props = { hoitoalueet: HoitoalueRivi[]; asiakkuudet: Asiakkuus[] };

export function HoitoalueetNakyma({ hoitoalueet, asiakkuudet }: Props) {
  const [valittuId, setValittuId] = useState<string | null>(hoitoalueet[0]?.id ?? null);
  const [haku, setHaku] = useState("");
  const [asiakkuusSuodatin, setAsiakkuusSuodatin] = useState("kaikki");
  const [modaaliAuki, setModaaliAuki] = useState(false);
  const [muokattava, setMuokattava] = useState<HoitoalueRivi | null>(null);

  useEffect(() => {
    if (valittuId && hoitoalueet.some((a) => a.id === valittuId)) return;
    setValittuId(hoitoalueet[0]?.id ?? null);
  }, [hoitoalueet, valittuId]);

  const nakyvat = useMemo(() => hoitoalueet.filter((a) => {
    const hakuOk = haku.trim() === "" || `${a.nimi} ${a.osoite} ${a.kiinteistotunnus ?? ""} ${a.asiakkuusNimi}`.toLowerCase().includes(haku.toLowerCase());
    const asiakkuusOk = asiakkuusSuodatin === "kaikki" || a.asiakkuusId === asiakkuusSuodatin;
    return hakuOk && asiakkuusOk;
  }), [asiakkuusSuodatin, haku, hoitoalueet]);

  const valittu = hoitoalueet.find((a) => a.id === valittuId) ?? null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Hoitoalueet</h1>
          <p className="text-sm text-muted">Hallitse hoitoalueita ja niiden asiakkuuksia</p>
        </div>
        <button type="button" onClick={() => { setMuokattava(null); setModaaliAuki(true); }} disabled={asiakkuudet.length === 0} className="btn-primary flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
          <Plus className="h-5 w-5" />
          Lisää hoitoalue
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr_320px] xl:grid-cols-[360px_1fr_360px]">
        <section className="metal-card flex max-h-[640px] flex-col rounded-2xl p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input type="search" value={haku} onChange={(e) => setHaku(e.target.value)} placeholder="Hae hoitoaluetta…" aria-label="Hae hoitoaluetta" className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <select value={asiakkuusSuodatin} onChange={(e) => setAsiakkuusSuodatin(e.target.value)} aria-label="Suodata asiakkuuden mukaan" className="mt-3 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="kaikki">Kaikki asiakkuudet</option>
            {asiakkuudet.map((a) => <option key={a.id} value={a.id}>{a.nimi}</option>)}
          </select>

          <ul className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
            {nakyvat.map((a) => {
              const valittuNyt = a.id === valittuId;
              return (
                <li key={a.id}>
                  <button type="button" onClick={() => setValittuId(a.id)} aria-current={valittuNyt ? "true" : undefined} className={`w-full rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${valittuNyt ? "border-primary bg-white" : "border-border/60 bg-white/50 hover:bg-white"}`}>
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Building2 className="h-4 w-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{a.nimi}</p>
                        <p className="mt-1 truncate text-xs text-muted">{a.osoite}</p>
                        <p className="mt-1 truncate text-xs font-medium text-primary">{a.asiakkuusNimi}</p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
            {nakyvat.length === 0 && <li className="py-8 text-center text-sm text-muted">Ei hoitoalueita valituilla hakuehdoilla.</li>}
          </ul>
        </section>

        <section className="metal-card overflow-hidden rounded-2xl p-2">
          <HoitoalueKartta alueet={nakyvat} valittuId={valittuId} onValitse={setValittuId} />
        </section>

        <aside className="metal-card flex max-h-[640px] flex-col overflow-y-auto rounded-2xl p-5">
          {valittu ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-foreground">{valittu.nimi}</h2>
                  <p className="mt-1 flex items-start gap-1.5 text-sm text-muted"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{valittu.osoite}</p>
                </div>
                <button type="button" onClick={() => { setMuokattava(valittu); setModaaliAuki(true); }} disabled={asiakkuudet.length === 0} className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50" title="Muokkaa hoitoaluetta">
                  <Pencil className="h-4 w-4" />
                  Muokkaa
                </button>
              </div>
              <div className="mt-5 rounded-xl border border-border/60 bg-white/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Asiakkuus</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{valittu.asiakkuusNimi}</p>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="text-muted">Kiinteistötunnus</dt><dd className="mt-0.5 font-medium text-foreground">{valittu.kiinteistotunnus || "Ei määritetty"}</dd></div>
                <div><dt className="text-muted">Karttasijainti</dt><dd className="mt-0.5 font-medium text-foreground">{valittu.lat !== null && valittu.lng !== null ? "Sijainti käytettävissä" : "Ei vielä määritetty"}</dd></div>
              </dl>
              {valittu.lat === null && <div className="mt-5 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-xs leading-5 text-muted">Kiinteistörajaa ei ole vielä liitetty. Alue ei ole vielä käytettävissä GPS-hoitoalueena.</div>}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center py-16 text-center text-sm text-muted">Valitse hoitoalue listasta.</div>
          )}
        </aside>
      </div>

      {modaaliAuki && <LisaaHoitoalueModaali asiakkuudet={asiakkuudet} muokattava={muokattava} onClose={() => { setModaaliAuki(false); setMuokattava(null); }} onSaved={() => { setModaaliAuki(false); setMuokattava(null); window.location.reload(); }} />}
    </div>
  );
}
