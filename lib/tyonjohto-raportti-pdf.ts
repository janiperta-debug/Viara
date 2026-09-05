import type { TyonjohtoRaporttiTapahtuma, TyonjohtoTyonSuoritus } from "@/lib/tyonjohto-raportit";

type PdfRaportti = {
  otsikko: string;
  kuvaus: string;
  aika: string;
  tapahtumat: TyonjohtoRaporttiTapahtuma[];
  suoritukset: TyonjohtoTyonSuoritus[];
  onTyosuoritus: boolean;
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_X = 48;
const TOP_Y = 790;
const LINE_HEIGHT = 15;
const MAX_LINES = 48;

function winAnsi(text: string) {
  const normalized = text.replace(/[–—]/g, "-").replace(/[“”]/g, '"').replace(/[’]/g, "'");
  const bytes: number[] = [];
  for (const char of normalized) {
    const code = char.charCodeAt(0);
    if (code <= 0x7f) bytes.push(code);
    else {
      const map: Record<string, number> = { Ä: 0xc4, Å: 0xc5, Ö: 0xd6, ä: 0xe4, å: 0xe5, ö: 0xf6, "·": 0xb7, "•": 0x95, "€": 0x80 };
      bytes.push(map[char] ?? 0x3f);
    }
  }
  return new Uint8Array(bytes);
}

function escapePdfText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrap(text: string, maxChars = 88) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) { lines.push(line); line = word; }
    else line = candidate;
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function buildLines(data: PdfRaportti) {
  const lines: { text: string; size?: number; bold?: boolean; gapBefore?: number }[] = [];
  lines.push({ text: "VIARA", size: 20, bold: true });
  lines.push({ text: data.otsikko, size: 16, bold: true, gapBefore: 8 });
  lines.push({ text: `${data.aika}  ·  ${data.kuvaus}`, size: 10, gapBefore: 3 });
  lines.push({ text: "", gapBefore: 8 });
  if (data.onTyosuoritus) {
    lines.push({ text: "HOITOALUEIDEN SUORITUS", size: 12, bold: true });
    if (data.suoritukset.length === 0) lines.push({ text: "Ei suoritusdataa." });
    for (const suoritus of data.suoritukset) {
      lines.push({ text: suoritus.hoitoalue, size: 11, bold: true, gapBefore: 7 });
      lines.push({ text: `Tila: ${suoritus.tila === "valmis" ? "Työ valmis" : suoritus.tila === "aloitettu" ? "Työ aloitettu" : "Ei tapahtumia"}` });
      lines.push({ text: `Työntekijät: ${suoritus.tyontekijat.join(", ") || "Ei tietoa"}` });
      lines.push({ text: `Työvälineet: ${suoritus.tyovalineet.join(", ") || "Ei tietoa"}` });
      lines.push({ text: `Saapuminen: ${suoritus.saapuminen ?? "-"}    Aloitus: ${suoritus.aloitus ?? "-"}` });
      lines.push({ text: `Valmistuminen: ${suoritus.valmistuminen ?? "-"}    Poistuminen: ${suoritus.poistuminen ?? "-"}` });
      lines.push({ text: `GPS: saapuminen ${gpsTeksti(suoritus.gpsSaapuminen)}, poistuminen ${gpsTeksti(suoritus.gpsPoistuminen)}` });
      lines.push({ text: `GPS-tapahtumia: ${suoritus.gpsTapahtumia}    Poikkeamia: ${suoritus.poikkeamia} (${suoritus.poikkeamatRatkaistu} ratkaistu)` });
    }
  } else {
    lines.push({ text: "TAPAHTUMAT", size: 12, bold: true });
    if (data.tapahtumat.length === 0) lines.push({ text: "Ei tapahtumia." });
    for (const tapahtuma of data.tapahtumat) {
      lines.push({ text: `${tapahtuma.aikaleima}  ·  ${tapahtuma.tyyppi}`, size: 10, bold: true, gapBefore: 5 });
      lines.push({ text: `${tapahtuma.hoitoalue}  ·  ${tapahtuma.tekija}` });
      lines.push({ text: `Työväline: ${tapahtuma.tyovaline ?? "-"}  ·  ${tapahtuma.gps ? "GPS tallennettu" : "Ei GPS-sijaintia"}` });
    }
  }
  return lines.flatMap((item) => wrap(item.text).map((text, index) => ({ ...item, text, gapBefore: index === 0 ? item.gapBefore : 0 })));
}

function gpsTeksti(tila: TyonjohtoTyonSuoritus["gpsSaapuminen"]) { return tila === "varmistettu" ? "varmistettu" : tila === "puuttuu" ? "puuttuu" : "ei täyty"; }

function makePage(lines: ReturnType<typeof buildLines>, pageIndex: number) {
  const start = pageIndex * MAX_LINES;
  const pageLines = lines.slice(start, start + MAX_LINES);
  const commands: string[] = ["BT"];
  let y = TOP_Y;
  for (const line of pageLines) {
    y -= line.gapBefore ?? 0;
    const size = line.size ?? 9;
    commands.push(`/F${line.bold ? "B" : "R"} ${size} Tf`);
    commands.push(`1 0 0 1 ${MARGIN_X} ${y} Tm`);
    commands.push(`(${escapePdfText(line.text)}) Tj`);
    y -= LINE_HEIGHT + Math.max(0, size - 9) * 0.7;
  }
  commands.push("ET");
  return commands.join("\n");
}

function asciiBytes(text: string) { return new TextEncoder().encode(text); }
function objectBytes(parts: (string | Uint8Array)[]) {
  const encoded = parts.map((part) => typeof part === "string" ? asciiBytes(part) : part);
  const length = encoded.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  for (const part of encoded) { result.set(part, offset); offset += part.length; }
  return result;
}

export function muodostaRaporttiPdf(data: PdfRaportti) {
  const lines = buildLines(data);
  const pageCount = Math.max(1, Math.ceil(lines.length / MAX_LINES));
  const objects: Uint8Array[] = [];
  const offsets: number[] = [];
  objects.push(objectBytes(["<< /Type /Catalog /Pages 2 0 R >>"]));
  const pageObjectIds = Array.from({ length: pageCount }, (_, i) => 5 + i * 2);
  const kids = pageObjectIds.map((id) => `${id} 0 R`).join(" ");
  objects.push(objectBytes([`<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>`]));
  objects.push(objectBytes(["<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"]));
  objects.push(objectBytes(["<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"]));
  for (let i = 0; i < pageCount; i++) {
    const pageId = 5 + i * 2;
    const contentId = pageId + 1;
    const stream = winAnsi(makePage(lines, i));
    objects.push(objectBytes([`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /FR 3 0 R /FB 4 0 R >> >> /Contents ${contentId} 0 R >>`]));
    objects.push(objectBytes([`<< /Length ${stream.length} >>\nstream\n`, stream, "\nendstream"]));
  }
  const header = objectBytes(["%PDF-1.4\n%\xFF\xFF\xFF\xFF\n"]);
  const chunks: Uint8Array[] = [header];
  let position = header.length;
  for (let i = 0; i < objects.length; i++) {
    offsets.push(position);
    const pdfObject = objectBytes([`${i + 1} 0 obj\n`, objects[i], "\nendobj\n"]);
    chunks.push(pdfObject);
    position += pdfObject.length;
  }
  const xrefOffset = position;
  const xref = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f ", ...offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n `), "trailer", `<< /Size ${objects.length + 1} /Root 1 0 R >>`, "startxref", `${xrefOffset}`, "%%EOF"].join("\n");
  chunks.push(asciiBytes(`${xref}\n`));
  const resultLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(resultLength);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}
