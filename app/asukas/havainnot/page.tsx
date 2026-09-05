import { HavainnotNakyma } from "@/components/asukas/havainnot-nakyma";
import { haeAsukasHoitoalue } from "@/lib/asukas-data";

export const dynamic = "force-dynamic";

export default async function AsukasHavainnotPage({
  searchParams,
}: {
  searchParams: Promise<{ hoitoalue?: string }>;
}) {
  const params = await searchParams;
  const alue = await haeAsukasHoitoalue(params.hoitoalue);

  if (!alue) {
    return (
      <div className="metal-card rounded-3xl p-6">
        <h1 className="text-xl font-bold text-foreground">Havainnot</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Havainnot avataan hoitoalueen QR-koodin kautta.
        </p>
      </div>
    );
  }

  return <HavainnotNakyma alue={alue} />;
}
