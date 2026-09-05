import Link from "next/link";
import { ArrowLeft, CircleCheck, MapPin, User, Wrench, Clock, FileText } from "lucide-react";
import { haeOmaOrganisaatioId } from "@/lib/tyonjohto-havainnot";
import { haeTyonjohtoRaportti } from "@/lib/tyonjohto-raportit";
import { muotoileViaraAika } from "@/lib/viara-aika";
import { vaadiRooli } from "@/lib/reitti-suojaus";

export default async function RaporttiPage({ params }: { params: Promise<{ id: string }> }) {
  await vaadiRooli(["tyonjohto", "admin"]);
  const { id } = await params;
  const organisaatioId = await haeOmaOrganisaatioId();
  const data = organisaatioId ? await haeTyonjohtoRaportti(organisaatioId, id) : null;

  if (!data) {
    return (
      <div className="flex flex-col gap-5">
        <Link href="/tyonjohto/raportit" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Takaisin raportteihin
        </Link>
        <div className="metal-card rounded-2xl p-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted" strokeWidth={1.5} />
          <h1 className="mt-3 text-lg font-semibold text-foreground">Raporttia ei löytynyt</h1>
          <p className="mt-1 text-sm text-muted">Raportille ei löytynyt tapahtumia tai se ei kuulu tähän organisaatioon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Link href="/tyonjohto/raportit" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Takaisin raportteihin
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{data.raportti.aika}</p>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">{data.raportti.otsikko}</h1>
          <p className="mt-1 text-sm text-muted">{data.raportti.kuvaus}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-600/10 px-3 py-1.5 text-sm font-medium text-green-700">
          <CircleCheck className="h-4 w-4" strokeWidth={2} /> Saatavilla
        </span>
      </div>

      <div className="metal-card overflow-hidden rounded-2xl">
        <div className="border-b border-border/70 px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Tapahtumat</h2>
          <p className="mt-0.5 text-sm text-muted">Raportin sisältö muodostuu Viaran tapahtumahistoriasta.</p>
        </div>
        <ul>
          {data.tapahtumat.map((tapahtuma) => (
            <li key={tapahtuma.id} className="border-b border-border/60 px-5 py-4 last:border-0">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="font-medium text-foreground">{tapahtuma.tyyppi}</div>
                  <div className="mt-1 text-sm text-muted">{tapahtuma.hoitoalue}</div>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm text-muted sm:grid-cols-3 lg:min-w-[520px] lg:text-right">
                  <span className="inline-flex items-center gap-1.5 sm:justify-end"><Clock className="h-4 w-4" />{muotoileViaraAika(tapahtuma.aikaleima, { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="inline-flex items-center gap-1.5 sm:justify-end"><User className="h-4 w-4" />{tapahtuma.tekija}</span>
                  <span className="inline-flex items-center gap-1.5 sm:justify-end">{tapahtuma.tyovaline ? <><Wrench className="h-4 w-4" />{tapahtuma.tyovaline}</> : <><MapPin className="h-4 w-4" />{tapahtuma.gps ? "GPS tallennettu" : "Ei GPS-sijaintia"}</>}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
