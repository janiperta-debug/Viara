import { OmaHoitoalue } from "@/components/asukas/oma-hoitoalue";
import { haeAsukasHoitoalue } from "@/lib/asukas-data";

export const dynamic = "force-dynamic";

export default async function AsukasPage({
  searchParams,
}: {
  searchParams: Promise<{ hoitoalue?: string }>;
}) {
  const params = await searchParams;
  const alue = await haeAsukasHoitoalue(params.hoitoalue);

  if (!alue) {
    return (
      <div className="metal-card rounded-3xl p-6">
        <h1 className="text-xl font-bold text-foreground">Asukasnäkymä</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Tämä näkymä avataan hoitoalueen QR-koodilla. Skannaa QR-koodi päästäksesi oman hoitoalueesi tietoihin.
        </p>
      </div>
    );
  }

  return <OmaHoitoalue alue={alue} />;
}
