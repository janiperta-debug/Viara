import { redirect } from "next/navigation";
import { haeOmaKayttaja } from "@/lib/oma-kayttaja";
import { onViaraRooli, sallitutNakymat } from "@/lib/nakymat";
import { asetaNakyma } from "@/app/actions/aseta-nakyma";
import type { AktiivinenNakyma } from "@/lib/nakyma-cookie";

const HREF_NAKYMA: Record<string, AktiivinenNakyma> = {
  "/tyo": "tyo",
  "/tyonjohto": "tyonjohto",
  "/asiakas": "asiakas",
};

export default async function ValitsePage() {
  const kayttaja = await haeOmaKayttaja();
  const rooli = kayttaja.rooli;

  if (!onViaraRooli(rooli)) {
    redirect("/kirjaudu");
  }

  const nakymat = sallitutNakymat(rooli);

  // kuljettaja ja asiakas ohjataan suoraan omaan näkymäänsä
  // (kirjaudu-action asettaa heille evästeen suoraan)
  if (rooli === "kuljettaja") redirect("/tyo");
  if (rooli === "asiakas") redirect("/asiakas");

  if (nakymat.length === 0) redirect("/kirjaudu");

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
          Valitse näkymä
        </h1>
        <p className="mb-8 text-center text-sm text-muted">
          {kayttaja.rooliLabel}
        </p>
        <div className="flex flex-col gap-4">
          {nakymat.map(({ href, label }) => {
            const nakyma = HREF_NAKYMA[href];
            if (!nakyma) return null;
            return (
              <form key={href} action={asetaNakyma.bind(null, nakyma)}>
                <button
                  type="submit"
                  className="btn-primary flex h-14 w-full items-center justify-center rounded-full text-base font-semibold text-primary-foreground"
                >
                  {label}
                </button>
              </form>
            );
          })}
        </div>
      </div>
    </main>
  );
}
