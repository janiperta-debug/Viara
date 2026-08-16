import { UrakkaSummary } from "@/components/tyonjohto/yleiskuva/urakka-summary";
import { OperatiivinenKartta } from "@/components/tyonjohto/yleiskuva/operatiivinen-kartta";
import { KuljettajaStatus } from "@/components/tyonjohto/yleiskuva/kuljettaja-status";
import { Tapahtumavirta } from "@/components/tyonjohto/yleiskuva/tapahtumavirta";
import { AvoimetHavainnot } from "@/components/tyonjohto/yleiskuva/avoimet-havainnot";

export default function YleiskuvaPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Ylärivi: yhteenveto + kuljettajat */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UrakkaSummary />
        </div>
        <div className="lg:col-span-1">
          <KuljettajaStatus />
        </div>
      </div>

      {/* Keskirivi: operatiivinen kartta + avoimet havainnot */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OperatiivinenKartta />
        </div>
        <div className="lg:col-span-1">
          <AvoimetHavainnot />
        </div>
      </div>

      {/* Alarivi: tapahtumavirta */}
      <Tapahtumavirta />
    </div>
  );
}
