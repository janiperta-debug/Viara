import { redirect } from "next/navigation";
import Link from "next/link";
import { haeOmaKayttaja } from "@/lib/oma-kayttaja";
import { onViaraRooli, sallitutNakymat } from "@/lib/nakymat";

export default async function ValitsePage() {
  const kayttaja = await haeOmaKayttaja();
  const rooli = kayttaja.rooli;

  if (!onViaraRooli(rooli)) {
    redirect("/kirjaudu");
  }

  const nakymat = sallitutNakymat(rooli);

  // kuljettaja ja asiakas ohjataan suoraan omaan näkymäänsä
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
          {nakymat.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="btn-primary flex h-14 items-center justify-center rounded-full text-base font-semibold text-primary-foreground"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
