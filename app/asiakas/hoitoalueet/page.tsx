import { haeAsiakasTiedot } from "@/lib/asiakas-data";
import { HoitoalueetNakyma } from "@/components/asiakas/hoitoalueet-nakyma";

export default async function AsiakasHoitoalueetPage() {
  const tiedot = await haeAsiakasTiedot();

  if (!tiedot) {
    return (
      <main className="flex min-h-screen flex-1 items-start justify-center px-5 py-10">
        <div className="w-full max-w-3xl rounded-2xl border border-border bg-white p-6">
          <h1 className="text-xl font-semibold text-foreground">Hoitoalueet</h1>
          <p className="mt-2 text-sm text-muted">Hoitoalueita ei voitu ladata.</p>
        </div>
      </main>
    );
  }

  if (!tiedot.asiakkuusId) {
    return (
      <main className="flex min-h-screen flex-1 items-start justify-center px-5 py-10">
        <div className="w-full max-w-3xl rounded-2xl border border-border bg-white p-6">
          <h1 className="text-xl font-semibold text-foreground">Hoitoalueet</h1>
          <p className="mt-2 text-sm text-muted">
            Käyttäjälle ei ole vielä määritetty asiakkuutta.
          </p>
        </div>
      </main>
    );
  }

  return <HoitoalueetNakyma alueet={tiedot.alueet} />;
}
