import Link from "next/link";
import { FileText, CircleCheck, ClipboardList, TriangleAlert, ChevronRight } from "lucide-react";
import { haeOmaOrganisaatioId } from "@/lib/tyonjohto-havainnot";
import { haeTyonjohtoRaportit } from "@/lib/tyonjohto-raportit";
import { vaadiRooli } from "@/lib/reitti-suojaus";

const ICONIT = {
  tyon_suoritus: ClipboardList,
  poikkeamat: TriangleAlert,
  tapahtumat: FileText,
} as const;

export default async function RaportitPage() {
  await vaadiRooli(["tyonjohto", "admin"]);
  const organisaatioId = await haeOmaOrganisaatioId();
  const raportit = organisaatioId ? await haeTyonjohtoRaportit(organisaatioId) : [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Raportit</h1>
        <p className="text-sm text-muted">Työ- ja tapahtumaraportit muodostetaan toteutuneesta tapahtumahistoriasta.</p>
      </div>

      {raportit.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {raportit.map((raportti) => {
            const Icon = ICONIT[raportti.tyyppi];
            return (
              <article key={raportti.id} className="metal-card flex flex-col gap-4 rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  {raportti.valmis && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-600/10 px-2.5 py-1 text-xs font-medium text-green-700">
                      <CircleCheck className="h-3.5 w-3.5" strokeWidth={2} />
                      Saatavilla
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">{raportti.otsikko}</h2>
                  <p className="text-sm text-muted">{raportti.kuvaus}</p>
                  <p className="mt-1 text-xs text-muted">{raportti.aika}</p>
                </div>
                <div className="mt-auto flex items-center justify-between rounded-lg border border-border bg-white/60 px-3 py-2 text-xs text-muted">
                  <span>{raportti.tapahtumia} tapahtumaa</span>
                  <Link href={`/tyonjohto/raportit/${raportti.id}`} className="inline-flex items-center gap-1 font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    Avaa raportti
                    <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="metal-card rounded-2xl p-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted" strokeWidth={1.5} />
          <h2 className="mt-3 text-base font-semibold text-foreground">Ei raportoitavaa vielä</h2>
          <p className="mt-1 text-sm text-muted">Raportit syntyvät automaattisesti, kun organisaatiolle kertyy tapahtumia.</p>
        </div>
      )}

      <p className="text-xs text-muted">Raportit perustuvat Viaran tapahtumahistoriaan. Avaa raportti ja lataa siitä PDF-versio.</p>
    </div>
  );
}
