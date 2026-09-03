import { AdmininOrganisaationLuonti } from "@/components/tyonjohto/kayttajat/kayttajahallinta";
import { vaadiRooli } from "@/lib/reitti-suojaus";

export default async function AdminKayttajatPage() {
  await vaadiRooli(["admin"]);

  return (
    <main className="flex min-h-screen flex-1 items-start justify-center px-5 py-10 lg:px-8 lg:py-16">
      <div className="w-full max-w-5xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-primary">Ylläpito</p>
          <h1 className="text-2xl font-semibold text-foreground">Käyttäjähallinta</h1>
          <p className="mt-1 text-sm text-muted">
            Luo uusi organisaatio ja sen ensimmäinen työnjohto.
          </p>
        </div>
        <AdmininOrganisaationLuonti />
      </div>
    </main>
  );
}
