import Link from "next/link";
import { notFound } from "next/navigation";
import { vaadiRooli } from "@/lib/reitti-suojaus";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { AdminOrganisaatioTiedot } from "@/components/admin/admin-organisaatio-tiedot";

export default async function AdminOrganisaatioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await vaadiRooli(["admin"]);
  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const asiakkuusIdt = await haeAsiakkuusIdt(admin, id);

  const [{ data: organisaatio }, { data: kayttajat }, { data: asiakkuudet }, { data: hoitoalueet }] = await Promise.all([
    admin.from("organisaatiot").select("id, nimi, luotu").eq("id", id).maybeSingle(),
    admin.from("kayttajat").select("id, nimi, rooli, asiakkuus_id").eq("organisaatio_id", id).order("nimi"),
    admin.from("asiakkuudet").select("id, nimi").eq("organisaatio_id", id).order("nimi"),
    asiakkuusIdt.length > 0
      ? admin.from("hoitoalueet").select("id, nimi, osoite, asiakkuus_id").in("asiakkuus_id", asiakkuusIdt).order("nimi")
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (!organisaatio) notFound();

  return (
    <main className="flex min-h-screen flex-1 items-start justify-center px-5 py-10 lg:px-8 lg:py-16">
      <div className="w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Ylläpito / Organisaatio</p>
            <h1 className="text-2xl font-semibold text-foreground">{organisaatio.nimi}</h1>
            <p className="mt-1 text-sm text-muted">Organisaation käyttäjät, asiakkuudet ja hoitoalueet.</p>
          </div>
          <Link href="/admin/kayttajat" className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-card">
            Takaisin ylläpitoon
          </Link>
        </div>

        <AdminOrganisaatioTiedot
          organisaatioId={organisaatio.id}
          organisaationNimi={organisaatio.nimi}
          kayttajat={(kayttajat ?? []).map((k) => ({ id: k.id, nimi: k.nimi, rooli: String(k.rooli), asiakkuusId: k.asiakkuus_id }))}
          asiakkuudet={(asiakkuudet ?? []).map((a) => ({ id: a.id, nimi: a.nimi }))}
          hoitoalueet={(hoitoalueet ?? []).map((h) => ({ id: h.id, nimi: h.nimi, osoite: h.osoite, asiakkuusId: h.asiakkuus_id }))}
        />
      </div>
    </main>
  );
}

async function haeAsiakkuusIdt(admin: ReturnType<typeof createSupabaseAdminClient>, organisaatioId: string) {
  const { data } = await admin.from("asiakkuudet").select("id").eq("organisaatio_id", organisaatioId);
  return (data ?? []).map((a) => a.id);
}
