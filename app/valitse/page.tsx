import { redirect } from "next/navigation";
import Link from "next/link";
import { haeOmaKayttaja } from "@/lib/oma-kayttaja";

export default async function ValitsePage() {
  const kayttaja = await haeOmaKayttaja();
  const rooli = kayttaja.rooli;

  // kuljettaja ja asiakas ohjataan suoraan omaan näkymäänsä
  if (rooli === "kuljettaja") redirect("/tyo");
  if (rooli === "asiakas") redirect("/asiakas");

  // tyonjohto ja admin saavat valinnan
  const nakymat: { href: string; label: string }[] = [];

  if (rooli === "tyonjohto" || rooli === "admin") {
    nakymat.push({ href: "/tyonjohto", label: "Työnjohto" });
    nakymat.push({ href: "/tyo", label: "Työ" });
  }
  if (rooli === "admin") {
    nakymat.push({ href: "/asiakas", label: "Asiakas" });
  }

  if (nakymat.length === 0) redirect("/tyo");

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
