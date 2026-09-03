import Link from "next/link";
import { AdmininOrganisaationLuonti } from "@/components/tyonjohto/kayttajat/kayttajahallinta";
import { vaadiRooli } from "@/lib/reitti-suojaus";
import { kirjauduUlos } from "@/app/actions/kirjaudu-ulos";

export default async function AdminKayttajatPage() {
  await vaadiRooli(["admin"]);

  return (
    <main className="flex min-h-screen flex-1 items-start justify-center px-5 py-10 lg:px-8 lg:py-16">
      <div className="w-full max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Ylläpito</p>
            <h1 className="text-2xl font-semibold text-foreground">Käyttäjähallinta</h1>
            <p className="mt-1 text-sm text-muted">
              Luo uusi organisaatio ja sen ensimmäinen työnjohto.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/valitse"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Takaisin
            </Link>
            <form action={kirjauduUlos}>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-destructive/25 bg-white px-4 text-sm font-semibold text-destructive shadow-sm transition hover:bg-destructive/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
              >
                Kirjaudu ulos
              </button>
            </form>
          </div>
        </div>
        <AdmininOrganisaationLuonti />
      </div>
    </main>
  );
}
