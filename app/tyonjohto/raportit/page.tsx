import Link from "next/link";
import { BookOpen, TriangleAlert, Download, FileText } from "lucide-react";
import { haeOmaOrganisaatioId } from "@/lib/tyonjohto-havainnot";
import { haeRaporttiValinnat, haeTyonjohtoRaporttiSuodattimilla, type RaporttiKohde, type RaporttiTyyppi } from "@/lib/tyonjohto-raportit";
import { vaadiRooli } from "@/lib/reitti-suojaus";

function oletusAlku() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`; }
function oletusLoppu() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()).padStart(2, "0")}`; }
function valitsevaKohdeNimi(valinnat: Awaited<ReturnType<typeof haeRaporttiValinnat>>, kohde: RaporttiKohde, id: string) { return kohde === "hoitoalue" ? valinnat.hoitoalueet.find((x) => x.id === id)?.nimi : valinnat.asiakkuudet.find((x) => x.id === id)?.nimi; }

export default async function RaportitPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await vaadiRooli(["tyonjohto", "admin"]);
  const organisaatioId = await haeOmaOrganisaatioId();
  if (!organisaatioId) return <div className="metal-card rounded-2xl p-8 text-center"><FileText className="mx-auto h-8 w-8 text-muted" /><h1 className="mt-3 text-lg font-semibold">Raportointi ei ole käytettävissä</h1></div>;

  const valinnat = await haeRaporttiValinnat(organisaatioId);
  const params = await searchParams;
  const tyyppi = (typeof params.tyyppi === "string" && ["hoitopaivakirja", "havainnot"].includes(params.tyyppi) ? params.tyyppi : "hoitopaivakirja") as RaporttiTyyppi;
  const kohde = (typeof params.kohde === "string" && ["hoitoalue", "asiakkuus"].includes(params.kohde) ? params.kohde : "hoitoalue") as RaporttiKohde;
  const oletusId = kohde === "hoitoalue" ? valinnat.hoitoalueet[0]?.id : valinnat.asiakkuudet[0]?.id;
  const kohdeId = typeof params.kohdeId === "string" && valitsevaKohdeNimi(valinnat, kohde, params.kohdeId) ? params.kohdeId : oletusId;
  const from = typeof params.from === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.from) ? params.from : oletusAlku();
  const to = typeof params.to === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.to) ? params.to : oletusLoppu();
  const raportti = kohdeId ? await haeTyonjohtoRaporttiSuodattimilla(organisaatioId, tyyppi, kohde, kohdeId, from, to) : null;
  const pdfHref = `/api/tyonjohto/raportit/pdf?tyyppi=${tyyppi}&kohde=${kohde}&kohdeId=${encodeURIComponent(kohdeId ?? "")}&from=${from}&to=${to}`;

  return <div className="flex flex-col gap-5">
    <div><h1 className="text-2xl font-semibold text-foreground">Raportit</h1><p className="text-sm text-muted">Raportit muodostetaan tapahtumahistoriasta valitulle kohteelle ja aikavälille.</p></div>

    <div className="grid gap-4 sm:grid-cols-2">
      <Link href={`/tyonjohto/raportit?tyyppi=hoitopaivakirja&kohde=${kohde}&kohdeId=${encodeURIComponent(kohdeId ?? "")}&from=${from}&to=${to}`} className={`metal-card rounded-2xl p-5 transition-shadow hover:shadow-md ${tyyppi === "hoitopaivakirja" ? "ring-2 ring-primary/30" : ""}`}><BookOpen className="h-7 w-7 text-primary" /><h2 className="mt-3 font-semibold text-foreground">Hoitopäiväkirja</h2><p className="mt-1 text-sm text-muted">Mitä kohteessa tehtiin ja milloin? Soveltuu esimerkiksi auraus- ja hiekoituspäiväkirjaksi.</p></Link>
      <Link href={`/tyonjohto/raportit?tyyppi=havainnot&kohde=${kohde}&kohdeId=${encodeURIComponent(kohdeId ?? "")}&from=${from}&to=${to}`} className={`metal-card rounded-2xl p-5 transition-shadow hover:shadow-md ${tyyppi === "havainnot" ? "ring-2 ring-primary/30" : ""}`}><TriangleAlert className="h-7 w-7 text-primary" /><h2 className="mt-3 font-semibold text-foreground">Havainnot ja poikkeamat</h2><p className="mt-1 text-sm text-muted">Mitä havaittiin, miten se käsiteltiin ja kuinka nopeasti?</p></Link>
    </div>

    <form method="get" className="metal-card rounded-2xl p-5">
      <input type="hidden" name="tyyppi" value={tyyppi} />
      <div className="grid gap-4 lg:grid-cols-[180px_1fr_1fr_1fr_1fr_auto] lg:items-end">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">Kohde<select name="kohde" defaultValue={kohde} className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm"><option value="hoitoalue">Hoitoalue</option><option value="asiakkuus">Asiakkuus</option></select></label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground lg:col-span-2">Valitse kohde<select name="kohdeId" defaultValue={kohdeId} className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm">{kohde === "hoitoalue" ? valinnat.hoitoalueet.map((x) => <option key={x.id} value={x.id}>{x.nimi}{x.osoite ? ` - ${x.osoite}` : ""}</option>) : valinnat.asiakkuudet.map((x) => <option key={x.id} value={x.id}>{x.nimi}</option>)}</select></label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">Alkaen<input type="date" name="from" defaultValue={from} className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm" /></label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">Päättyen<input type="date" name="to" defaultValue={to} className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm" /></label>
        <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Luo raportti</button>
      </div>
    </form>

    {raportti ? <div className="metal-card overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 px-5 py-5"><div><p className="text-sm font-medium text-muted">{raportti.aikavali}</p><h2 className="mt-1 text-xl font-semibold text-foreground">{tyyppi === "hoitopaivakirja" ? "Hoitopäiväkirja" : "Havainnot ja poikkeamat"}</h2><p className="mt-1 text-sm text-muted">{raportti.kohde} · {raportti.tapahtumia} {tyyppi === "hoitopaivakirja" ? "riviä" : "havaintoa"}</p></div><a href={pdfHref} className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted/10"><Download className="h-4 w-4" /> Lataa PDF</a></div>
      {tyyppi === "hoitopaivakirja" ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border/60 text-left text-xs text-muted"><th className="px-5 py-3">Päivä</th><th className="px-5 py-3">Hoitoalue</th><th className="px-5 py-3">Työ</th><th className="px-5 py-3">Aika</th><th className="px-5 py-3">Kesto</th><th className="px-5 py-3">Tekijä</th><th className="px-5 py-3">Työväline</th></tr></thead><tbody>{raportti.hoitopaivakirja.map((rivi, i) => <tr key={`${rivi.paiva}-${rivi.hoitoalue}-${rivi.aloitus}-${i}`} className="border-b border-border/40 last:border-0"><td className="px-5 py-3 whitespace-nowrap">{rivi.paiva}</td><td className="px-5 py-3 font-medium">{rivi.hoitoalue}</td><td className="px-5 py-3">{rivi.tapahtuma}</td><td className="px-5 py-3 whitespace-nowrap">{rivi.aloitus ?? "-"} - {rivi.lopetus ?? "-"}</td><td className="px-5 py-3 whitespace-nowrap">{rivi.kestoMinuutit !== null ? `${rivi.kestoMinuutit} min` : "-"}</td><td className="px-5 py-3">{rivi.tekija}</td><td className="px-5 py-3">{rivi.tyovaline ?? "-"}</td></tr>)}</tbody></table>{raportti.hoitopaivakirja.length === 0 && <div className="p-8 text-center text-sm text-muted">Ei tapahtumia valitulla aikavälillä. Kun varsinaiset työsuoritustapahtumat kirjautuvat, ne näkyvät tässä automaattisesti.</div>}</div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border/60 text-left text-xs text-muted"><th className="px-5 py-3">Päivä</th><th className="px-5 py-3">Hoitoalue</th><th className="px-5 py-3">Havainto</th><th className="px-5 py-3">Tila</th><th className="px-5 py-3">Luotu</th><th className="px-5 py-3">Työn alle</th><th className="px-5 py-3">Ratkaistu</th><th className="px-5 py-3">Käsittelyaika</th></tr></thead><tbody>{raportti.havainnot.map((rivi, i) => <tr key={`${rivi.paiva}-${rivi.hoitoalue}-${rivi.tyyppi}-${i}`} className="border-b border-border/40 last:border-0"><td className="px-5 py-3 whitespace-nowrap">{rivi.paiva}</td><td className="px-5 py-3 font-medium">{rivi.hoitoalue}</td><td className="px-5 py-3">{rivi.tyyppi}</td><td className="px-5 py-3">{rivi.tila}</td><td className="px-5 py-3 whitespace-nowrap">{rivi.luotu ?? "-"}</td><td className="px-5 py-3 whitespace-nowrap">{rivi.tyonAlle ?? "-"}</td><td className="px-5 py-3 whitespace-nowrap">{rivi.ratkaistu ?? "-"}</td><td className="px-5 py-3 whitespace-nowrap">{rivi.kasittelyMinuutit !== null ? `${rivi.kasittelyMinuutit} min` : "-"}</td></tr>)}</tbody></table>{raportti.havainnot.length === 0 && <div className="p-8 text-center text-sm text-muted">Ei havaintoja valitulla aikavälillä.</div>}</div>}
    </div> : <div className="metal-card rounded-2xl p-8 text-center text-sm text-muted">Valitse raportin kohde ja aikaväli.</div>}
  </div>;
}
