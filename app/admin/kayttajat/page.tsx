import Link from "next/link";
import { AdmininOrganisaationLuonti } from "@/components/tyonjohto/kayttajat/kayttajahallinta";
import { AdminYllapito } from "@/components/admin/admin-yllapito";
import { vaadiRooli } from "@/lib/reitti-suojaus";
import { kirjauduUlos } from "@/app/actions/kirjaudu-ulos";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { AdminOrganisaatio } from "@/app/actions/admin";

export default async function AdminKayttajatPage() {
  await vaadiRooli(["admin"]);

  const admin = createSupabaseAdminClient();
  const [{ data: organisaatiot }, { data: kayttajat }, { data: asiakkuudet }, { data: hoitoalueet }] = await Promise.all([
    admin.from("organisaatiot").select("id, nimi").order("nimi"),
    admin.from("kayttajat").select("id, organisaatio_id"),
    admin.from("asiakkuudet").select("id, organisaatio_id"),
    admin.from("hoitoalueet").select("id, asiakkuus_id"),
  ]);

  const adminOrganisaatiot: AdminOrganisaatio[] = (organisaatiot ?? []).map((organisaatio) => {
    const kayttajaMaara = (kayttajat ?? []).filter((k) => k.organisaatio_id === organisaatio.id).length;
    const asiakkuusMaara = (asiakkuudet ?? []).filter((a) => a.organisaatio_id === organisaatio.id).length;
    const asiakkuusIdt = new Set((asiakkuudet ?? []).filter((a) => a.organisaatio_id === organisaatio.id).map((a) => a.id));
    const hoitoalueMaara = (hoitoalueet ?? []).filter((h) => h.asiakkuus_id && asiakkuusIdt.has(h.asiakkuus_id)).length;
    return {
      id: organisaatio.id,
      nimi: organisaatio.nimi,
      kayttajia: kayttajaMaara,
      asiakkuuksia: asiakkuusMaara,
      hoitoalueita: hoitoalueMaara,
    };
  });

  return (
    <main className="flex min-h-screen flex-1 items-start justify-center px-5 py-10 lg:px-8 lg:py-16">
      <div className="w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Viara</p>
            <h1 className="text-2xl font-semibold text-foreground">Ylläpito</h1>
            <p className="mt-1 text-sm text-muted">Hallitse Viara-alustan organisaatioita ja seuraa kokonaisuuden tilaa.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/valitse" className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Takaisin</Link>
            <form action={kirjauduUlos}>
              <button type="submit" className="inline-flex h-10 items-center justify-center rounded-xl border border-destructive/25 bg-white px-4 text-sm font-semibold text-destructive shadow-sm transition hover:bg-destructive/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive">Kirjaudu ulos</button>
            </form>
          </div>
        </div>

        <AdminYllapito organisaatiot={adminOrganisaatiot} />

        <section className="mt-6">
          <AdmininOrganisaationLuonti />
        </section>
      </div>
    </main>
  );
}
