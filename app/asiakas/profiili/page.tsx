import { Building2, Mail, Shield, LogOut } from "lucide-react";
import { haeAsiakasTiedot } from "@/lib/asiakas-data";
import { haeOmaKayttaja } from "@/lib/oma-kayttaja";
import { kirjauduUlos } from "@/app/actions/kirjaudu-ulos";
import { vaadiRooli } from "@/lib/reitti-suojaus";
import { Profiilikuva } from "@/components/asiakas/profiili/profiilikuva";

export default async function AsiakasProfiiliPage() {
  await vaadiRooli(["asiakas", "tyonjohto", "admin"]);
  const [kayttaja, tiedot] = await Promise.all([haeOmaKayttaja(), haeAsiakasTiedot()]);

  const organisaatio = tiedot?.asiakkuusNimi ?? "Ei määritetty";
  const hoitoalueita = tiedot?.alueet.length ?? 0;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header><h1 className="text-3xl font-bold text-foreground md:text-4xl">Profiili</h1></header>

      <section className="metal-card flex items-center gap-4 rounded-3xl p-5" aria-label="Käyttäjä">
        <Profiilikuva nimi={kayttaja.nimi} initiaalit={kayttaja.initiaalit} avatarUrl={kayttaja.avatarUrl} />
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground">{kayttaja.nimi}</p>
          <p className="text-sm text-muted">{kayttaja.rooliLabel}</p>
        </div>
      </section>

      <section className="metal-card flex flex-col divide-y divide-border/60 rounded-3xl px-5" aria-label="Tilin tiedot">
        <Rivi Icon={Building2} otsikko="Organisaatio" arvo={organisaatio} />
        <Rivi Icon={Mail} otsikko="Sähköposti" arvo={kayttaja.email} />
        <Rivi Icon={Shield} otsikko="Käyttöoikeus" arvo={`${hoitoalueita} hoitoaluetta`} />
      </section>

      <p className="text-sm leading-relaxed text-muted">
        Asiakaskäyttäjänä näet omat hoitoalueesi, niiden tilanteen ja havainnot sekä voit tehdä uusia havaintoja. Operatiivinen hallinta, kuljettajien ohjaus ja asetukset kuuluvat työnjohdolle.
      </p>

      <form action={kirjauduUlos}>
        <button type="submit" className="metal-card flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 font-semibold text-destructive transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive">
          <LogOut className="h-5 w-5" />
          Kirjaudu ulos
        </button>
      </form>
    </div>
  );
}

function Rivi({ Icon, otsikko, arvo }: { Icon: typeof Building2; otsikko: string; arvo: string }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-muted shadow-sm"><Icon className="h-5 w-5" strokeWidth={1.75} /></span>
      <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-muted">{otsikko}</p><p className="truncate text-base text-foreground">{arvo}</p></div>
    </div>
  );
}
