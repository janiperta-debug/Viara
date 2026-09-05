import type { HavaintoRaporttiRivi, HoitopaivakirjaRivi } from "@/lib/tyonjohto-raportit";

type PdfRaportti = { otsikko: string; kohde: string; aikavali: string; hoitopaivakirja: HoitopaivakirjaRivi[]; havainnot: HavaintoRaporttiRivi[] };

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_X = 48;
const TOP_Y = 790;
const LINE_HEIGHT = 15;
const MAX_LINES = 48;

function winAnsi(text: string) {
  const normalized = text.split("–").join("-").split("—").join("-").split("“").join('"').split("”").join('"').split("’").join("'");
  const map: Record<string, number> = { Ä: 0xc4, Å: 0xc5, Ö: 0xd6, ä: 0xe4, å: 0xe5, ö: 0xf6, "·": 0xb7, "•": 0x95, "€": 0x80 };
  const bytes: number[] = [];
  for (const char of normalized) { const code = char.charCodeAt(0); bytes.push(code <= 0x7f ? code : map[char] ?? 0x3f); }
  return new Uint8Array(bytes);
}

function escapePdfText(text: string) { return text.split("\\").join("\\\\").split("(").join("\\(").split(")").join("\\)"); }

function wrap(text: string, maxChars = 88) {
  const words = text.split(/\s+/).filter(Boolean); const lines: string[] = []; let line = "";
  for (const word of words) { const candidate = line ? `${line} ${word}` : word; if (candidate.length > maxChars && line) { lines.push(line); line = word; } else line = candidate; }
  if (line) lines.push(line); return lines.length ? lines : [""];
}

function buildLines(data: PdfRaportti) {
  const lines: { text: string; size?: number; bold?: boolean; gapBefore?: number }[] = [];
  lines.push({ text: "VIARA", size: 20, bold: true });
  lines.push({ text: data.otsikko, size: 16, bold: true, gapBefore: 8 });
  lines.push({ text: `${data.kohde}  ·  ${data.aikavali}`, size: 10, gapBefore: 3 });
  lines.push({ text: "", gapBefore: 8 });
  if (data.otsikko === "Hoitopäiväkirja") {
    lines.push({ text: "HOITOPÄIVÄKIRJA", size: 12, bold: true });
    if (data.hoitopaivakirja.length === 0) lines.push({ text: "Ei tapahtumia valitulla aikavälillä." });
    for (const rivi of data.hoitopaivakirja) {
      lines.push({ text: `${rivi.paiva}  ·  ${rivi.hoitoalue}`, size: 11, bold: true, gapBefore: 6 });
      lines.push({ text: `${rivi.tapahtuma}  ·  ${rivi.aloitus ?? "-"} - ${rivi.lopetus ?? "-"}  ·  ${rivi.kestoMinuutit !== null ? `${rivi.kestoMinuutit} min` : "kesto ei tiedossa"}` });
      lines.push({ text: `Tekijä: ${rivi.tekija}  ·  Työväline: ${rivi.tyovaline ?? "-"}  ·  ${rivi.gps ? "GPS tallennettu" : "Ei GPS-sijaintia"}` });
    }
  } else {
    lines.push({ text: "HAVAINNOT JA POIKKEAMAT", size: 12, bold: true });
    if (data.havainnot.length === 0) lines.push({ text: "Ei havaintoja valitulla aikavälillä." });
    for (const rivi of data.havainnot) {
      lines.push({ text: `${rivi.paiva}  ·  ${rivi.hoitoalue}  ·  ${rivi.tyyppi}`, size: 11, bold: true, gapBefore: 6 });
      lines.push({ text: `Tila: ${rivi.tila}  ·  Luotu: ${rivi.luotu ?? "-"}  ·  Työn alle: ${rivi.tyonAlle ?? "-"}` });
      lines.push({ text: `Ratkaistu: ${rivi.ratkaistu ?? "-"}  ·  Käsittelyaika: ${rivi.kasittelyMinuutit !== null ? `${rivi.kasittelyMinuutit} min` : "ei ratkaistu"}` });
    }
  }
  return lines.flatMap((item) => wrap(item.text).map((text, index) => ({ ...item, text, gapBefore: index === 0 ? item.gapBefore : 0 })));
}

function makePage(lines: ReturnType<typeof buildLines>, pageIndex: number) {
  const pageLines = lines.slice(pageIndex * MAX_LINES, pageIndex * MAX_LINES + MAX_LINES); const commands: string[] = ["BT"]; let y = TOP_Y;
  for (const line of pageLines) { y -= line.gapBefore ?? 0; const size = line.size ?? 9; commands.push(`/F${line.bold ? "B" : "R"} ${size} Tf`); commands.push(`1 0 0 1 ${MARGIN_X} ${y} Tm`); commands.push(`(${escapePdfText(line.text)}) Tj`); y -= LINE_HEIGHT + Math.max(0, size - 9) * 0.7; }
  commands.push("ET"); return commands.join("\n");
}

function asciiBytes(text: string) { return new TextEncoder().encode(text); }
function objectBytes(parts: (string | Uint8Array)[]) { const encoded = parts.map((part) => typeof part === "string" ? asciiBytes(part) : part); const length = encoded.reduce((sum, part) => sum + part.length, 0); const result = new Uint8Array(length); let offset = 0; for (const part of encoded) { result.set(part, offset); offset += part.length; } return result; }

export function muodostaRaporttiPdf(data: PdfRaportti) {
  const lines = buildLines(data); const pageCount = Math.max(1, Math.ceil(lines.length / MAX_LINES)); const objects: Uint8Array[] = []; const offsets: number[] = [];
  objects.push(objectBytes(["<< /Type /Catalog /Pages 2 0 R >>"]));
  const pageObjectIds = Array.from({ length: pageCount }, (_, i) => 5 + i * 2); const kids = pageObjectIds.map((id) => `${id} 0 R`).join(" "); objects.push(objectBytes([`<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>`]));
  objects.push(objectBytes(["<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"]));
  objects.push(objectBytes(["<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"]));
  for (let i = 0; i < pageCount; i++) {
    const pageId = 5 + i * 2; const contentId = pageId + 1; const stream = winAnsi(makePage(lines, i));
    const pageDictionary = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /FR 3 0 R /FB 4 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects.push(objectBytes([pageDictionary]));
    objects.push(objectBytes([`<< /Length ${stream.length} >>\nstream\n`, stream, "\nendstream"]));
  }
  const header = objectBytes(["%PDF-1.4\n%\xFF\xFF\xFF\xFF\n"]); const chunks: Uint8Array[] = [header]; let position = header.length;
  for (let i = 0; i < objects.length; i++) { offsets.push(position); const pdfObject = objectBytes([`${i + 1} 0 obj\n`, objects[i], "\nendobj\n"]); chunks.push(pdfObject); position += pdfObject.length; }
  const xrefOffset = position; const xref = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f ", ...offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n `), "trailer", `<< /Size ${objects.length + 1} /Root 1 0 R >>`, "startxref", `${xrefOffset}`, "%%EOF"].join("\n"); chunks.push(asciiBytes(`${xref}\n`));
  const resultLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0); const result = new Uint8Array(resultLength); let offset = 0; for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; } return result;
}
