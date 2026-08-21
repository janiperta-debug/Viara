import { TopBar } from "@/components/dashboard/top-bar";
import { HavainnotLista } from "@/components/havainnot/havainnot-lista";
import { vaadiRooli } from "@/lib/reitti-suojaus";

export default async function HavainnotPage() {
  const rooli = await vaadiRooli(["kuljettaja", "tyonjohto", "admin"]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <TopBar notifications={3} active="havainnot" rooli={rooli} />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pb-6 pt-2 md:max-w-2xl md:gap-7 md:px-8 md:pt-4 lg:max-w-3xl lg:px-10 lg:pt-6">
        {/* Otsikko */}
        <section>
          <h1 className="px-1 text-3xl font-bold text-foreground md:text-4xl">
            Havainnot
          </h1>
          <p className="mt-1 px-1 text-sm text-muted">
            Kentällä tehdyt havainnot
          </p>
        </section>

        <HavainnotLista />
      </main>
    </div>
  );
}
