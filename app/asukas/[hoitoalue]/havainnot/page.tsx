import { HavainnotNakyma } from "@/components/asukas/havainnot-nakyma";
import { haeAsukasHoitoalue } from "@/lib/asukas-data";

export const dynamic = "force-dynamic";

export default async function AsukasHoitoalueHavainnotPage({
  params,
}: {
  params: Promise<{ hoitoalue: string }>;
}) {
  const { hoitoalue } = await params;
  const alue = await haeAsukasHoitoalue(hoitoalue);

  if (!alue) {
    return (
      <div className="metal-card rounded-3xl p-6">
        <h1 className="text-xl font-bold text-foreground">Havainnot</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Hoitoaluetta ei löytynyt. Tarkista QR-koodi ja yritä uudelleen.
        </p>
      </div>
    );
  }

  return <HavainnotNakyma alue={alue} />;
}
