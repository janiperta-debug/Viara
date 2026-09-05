import { NextResponse } from "next/server";
import { haeOmaOrganisaatioId } from "@/lib/tyonjohto-havainnot";
import { haeTyonjohtoRaportti } from "@/lib/tyonjohto-raportit";
import { muodostaRaporttiPdf } from "@/lib/tyonjohto-raportti-pdf";
import { vaadiRooli } from "@/lib/reitti-suojaus";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await vaadiRooli(["tyonjohto", "admin"]);
  const { id } = await params;
  const organisaatioId = await haeOmaOrganisaatioId();
  const data = organisaatioId ? await haeTyonjohtoRaportti(organisaatioId, id) : null;
  if (!data) return NextResponse.json({ virhe: "Raporttia ei löytynyt." }, { status: 404 });

  const pdf = muodostaRaporttiPdf({
    otsikko: data.raportti.otsikko,
    kuvaus: data.raportti.kuvaus,
    aika: data.raportti.aika,
    tapahtumat: data.tapahtumat,
    suoritukset: data.suoritukset,
    onTyosuoritus: data.raportti.tyyppi === "tyon_suoritus",
  });

  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "_");
  return new NextResponse(pdf.buffer as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="viara-raportti-${safeId}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
