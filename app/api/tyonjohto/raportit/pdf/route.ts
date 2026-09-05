import { NextResponse } from "next/server";
import { haeOmaOrganisaatioId } from "@/lib/tyonjohto-havainnot";
import { haeTyonjohtoRaporttiSuodattimilla, type RaporttiKohde, type RaporttiTyyppi } from "@/lib/tyonjohto-raportit";
import { muodostaRaporttiPdf } from "@/lib/tyonjohto-raportti-pdf";
import { vaadiRooli } from "@/lib/reitti-suojaus";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await vaadiRooli(["tyonjohto", "admin"]);
  const url = new URL(request.url);
  const tyyppi = url.searchParams.get("tyyppi");
  const kohde = url.searchParams.get("kohde");
  const kohdeId = url.searchParams.get("kohdeId");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  if (!["hoitopaivakirja", "havainnot"].includes(tyyppi ?? "") || !["hoitoalue", "asiakkuus"].includes(kohde ?? "") || !kohdeId || !from || !to) return NextResponse.json({ virhe: "Raportin valinnat puuttuvat." }, { status: 400 });

  const organisaatioId = await haeOmaOrganisaatioId();
  const data = organisaatioId ? await haeTyonjohtoRaporttiSuodattimilla(organisaatioId, tyyppi as RaporttiTyyppi, kohde as RaporttiKohde, kohdeId, from, to) : null;
  if (!data) return NextResponse.json({ virhe: "Raporttia ei löytynyt." }, { status: 404 });

  const pdf = muodostaRaporttiPdf({ otsikko: data.tyyppi === "hoitopaivakirja" ? "Hoitopäiväkirja" : "Havainnot ja poikkeamat", kohde: data.kohde, aikavali: data.aikavali, hoitopaivakirja: data.hoitopaivakirja, havainnot: data.havainnot });
  const safeName = `${data.tyyppi}-${data.kohde}`.replace(/[^a-zA-Z0-9_-]/g, "_");
  return new NextResponse(pdf.buffer as ArrayBuffer, { status: 200, headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="viara-${safeName}.pdf"`, "Cache-Control": "private, no-store" } });
}
