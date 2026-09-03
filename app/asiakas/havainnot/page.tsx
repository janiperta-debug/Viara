import { AsiakasHavainnotNakyma } from "@/components/asiakas/asiakas-havainnot-nakyma";
import { haeAsiakasHavainnot } from "@/lib/asiakas-havainnot";

export default async function AsiakasHavainnotPage() {
  const havainnot = await haeAsiakasHavainnot();

  if (havainnot === null) {
    return (
      <div className="metal-card rounded-3xl p-6">
        <h1 className="text-xl font-bold text-foreground">Havainnot</h1>
        <p className="mt-2 text-sm text-muted">Havaintoja ei voitu ladata.</p>
      </div>
    );
  }

  return <AsiakasHavainnotNakyma havainnot={havainnot} />;
}
