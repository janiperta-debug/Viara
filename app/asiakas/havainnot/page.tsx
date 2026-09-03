import { AsiakasHavainnotNakyma } from "@/components/asiakas/asiakas-havainnot-nakyma";
import { UusiAsiakasHavainto } from "@/components/asiakas/asiakas-havainnot-lomake";
import { haeAsiakasHavainnot } from "@/lib/asiakas-havainnot";
import { haeAsiakasTiedot } from "@/lib/asiakas-data";

export default async function AsiakasHavainnotPage() {
  const [havainnot, tiedot] = await Promise.all([haeAsiakasHavainnot(), haeAsiakasTiedot()]);

  if (havainnot === null || tiedot === null) {
    return (
      <div className="metal-card rounded-3xl p-6">
        <h1 className="text-xl font-bold text-foreground">Havainnot</h1>
        <p className="mt-2 text-sm text-muted">Havaintoja ei voitu ladata.</p>
      </div>
    );
  }

  return <AsiakasHavainnotSivu havainnot={havainnot} alueet={tiedot.alueet} />;
}

function AsiakasHavainnotSivu({
  havainnot,
  alueet,
}: {
  havainnot: Awaited<ReturnType<typeof haeAsiakasHavainnot>> extends infer T ? Exclude<T, null> : never;
  alueet: Awaited<ReturnType<typeof haeAsiakasTiedot>> extends infer T ? Exclude<T, null>["alueet"] : never;
}) {
  return (
    <>
      <AsiakasHavainnotNakyma havainnot={havainnot} alueet={alueet} />
      <UusiAsiakasHavainto alueet={alueet} onClose={() => undefined} />
    </>
  );
}
