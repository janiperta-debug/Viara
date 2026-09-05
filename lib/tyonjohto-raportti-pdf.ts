import type { HavaintoRaporttiRivi, HoitopaivakirjaRivi } from "@/lib/tyonjohto-raportit";

type PdfRaportti = {
  otsikko: string;
  kohde: string;
  aikavali: string;
  hoitopaivakirja: HoitopaivakirjaRivi[];
  havainnot: HavaintoRaporttiRivi[];
};

type PdfLine = {
  text: string;
  size?: number;
  bold?: boolean;
  gapBefore?: number;
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_X = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const TOP_Y = 780;
const FOOTER_Y = 38;
const LINE_HEIGHT = 15;
const MAX_LINES = 42;
const BRAND = "0.055 0.486 0.525";
const DARK = "0.10 0.15 0.23";
const MUTED = "0.38 0.43 0.48";
const LIGHT = "0.93 0.95 0.96";
const BORDER = "0.78 0.81 0.83";

function winAnsi(text: string) {
  const normalized = text
    .split("–").join("-")
    .split("—").join("-")
    .split("“").join('"')
    .split("”").join('"')
    .split("’").join("'");
  const map: Record<string, number> = {
    Ä: 0xc4,
    Å: 0xc5,
    Ö: 0xd6,
    ä: 0xe4,
    å: 0xe5,
    ö: 0xf6,
    "·": 0xb7,
    "•": 0x95,
    "€": 0x80,
  };
  const bytes: number[] = [];
  for (const char of normalized) {
    const code = char.charCodeAt(0);
    bytes.push(code <= 0x7f ? code : map[char] ?? 0x3f);
  }
  return new Uint8Array(bytes);
}

function escapePdfText(text: string) {
  return text.split("\\").join("\\\\").split("(").join("\\(").split(")").join("\\)");
}

function wrap(text: string, maxChars = 86) {
  const words = text.trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function buildLines(data: PdfRaportti) {
  const lines: PdfLine[] = [];

  if (data.otsikko === "Hoitopäiväkirja") {
    if (data.hoitopaivakirja.length === 0) {
      lines.push({ text: "Ei tapahtumia valitulla aikavälillä." });
    }
    for (const rivi of data.hoitopaivakirja) {
      lines.push({ text: `${rivi.paiva}  ·  ${rivi.hoitoalue}`, size: 10.5, bold: true, gapBefore: 7 });
      lines.push({ text: `${rivi.tapahtuma}  ·  ${rivi.aloitus ?? "-"} - ${rivi.lopetus ?? "-"}  ·  ${rivi.kestoMinuutit !== null ? `${rivi.kestoMinuutit} min` : "kesto ei tiedossa"}` });
      lines.push({ text: `Tekijä: ${rivi.tekija}  ·  Työväline: ${rivi.tyovaline ?? "-"}  ·  ${rivi.gps ? "GPS tallennettu" : "Ei GPS-sijaintia"}`, size: 8.5 });
    }
  } else {
    if (data.havainnot.length === 0) {
      lines.push({ text: "Ei havaintoja valitulla aikavälillä." });
    }
    for (const rivi of data.havainnot) {
      lines.push({ text: `${rivi.paiva}  ·  ${rivi.hoitoalue}  ·  ${rivi.tyyppi}`, size: 10.5, bold: true, gapBefore: 7 });
      lines.push({ text: `Tila: ${rivi.tila}  ·  Luotu: ${rivi.luotu ?? "-"}  ·  Työn alle: ${rivi.tyonAlle ?? "-"}` });
      lines.push({ text: `Ratkaistu: ${rivi.ratkaistu ?? "-"}  ·  Käsittelyaika: ${rivi.kasittelyMinuutit !== null ? `${rivi.kasittelyMinuutit} min` : "ei ratkaistu"}`, size: 8.5 });
    }
  }

  return lines.flatMap((item) =>
    wrap(item.text).map((text, index) => ({
      ...item,
      text,
      gapBefore: index === 0 ? item.gapBefore : 0,
    })),
  );
}

function textCommand(text: string, x: number, y: number, size: number, bold = false) {
  const font = bold ? "FB" : "FR";
  return `${DARK} rg /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdfText(text)}) Tj`;
}

function rectCommand(x: number, y: number, width: number, height: number, color: string) {
  return `${color} rg ${x} ${y} ${width} ${height} re f`;
}

function lineCommand(x1: number, y1: number, x2: number, y2: number, color = BORDER, width = 0.7) {
  return `${color} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S`;
}

function makePage(data: PdfRaportti, pageLines: PdfLine[], pageIndex: number, pageCount: number) {
  const commands: string[] = [];
  commands.push("q");

  // Viara-brändätty tunnus: yksinkertainen V-merkki, joka toimii myös ilman rasterikuvaa.
  commands.push(`${BRAND} rg`);
  commands.push(`${MARGIN_X} ${TOP_Y - 3} m ${MARGIN_X + 8} ${TOP_Y - 19} l ${MARGIN_X + 16} ${TOP_Y - 3} l ${MARGIN_X + 12} ${TOP_Y - 3} l ${MARGIN_X + 8} ${TOP_Y - 12} l ${MARGIN_X + 4} ${TOP_Y - 3} l h f`);
  commands.push(`${DARK} rg /FB 15 Tf 1 0 0 1 ${MARGIN_X + 24} ${TOP_Y - 15} Tm (VIARA) Tj`);
  commands.push(lineCommand(MARGIN_X, TOP_Y - 29, MARGIN_X + CONTENT_WIDTH, TOP_Y - 29, BRAND, 1.2));

  let y = TOP_Y - 58;
  commands.push(textCommand(data.otsikko, MARGIN_X, y, 18, true));
  y -= 24;
  commands.push(textCommand(data.kohde, MARGIN_X, y, 10.5, false));
  commands.push(`${MUTED} rg /FR 9 Tf 1 0 0 1 ${PAGE_WIDTH - MARGIN_X - 170} ${y} Tm (${escapePdfText(data.aikavali)}) Tj`);
  y -= 18;
  commands.push(lineCommand(MARGIN_X, y, MARGIN_X + CONTENT_WIDTH, y, BORDER, 0.7));
  y -= 25;

  const sectionTitle = data.otsikko === "Hoitopäiväkirja" ? "HOITOPÄIVÄKIRJA" : "HAVAINNOT JA POIKKEAMAT";
  commands.push(rectCommand(MARGIN_X, y - 5, CONTENT_WIDTH, 23, LIGHT));
  commands.push(`${DARK} rg /FB 9 Tf 1 0 0 1 ${MARGIN_X + 9} ${y + 3} Tm (${sectionTitle}) Tj`);
  y -= 32;

  for (const line of pageLines) {
    y -= line.gapBefore ?? 0;
    const size = line.size ?? 9;
    if (line.bold) {
      commands.push(`${DARK} rg /FB ${size} Tf 1 0 0 1 ${MARGIN_X} ${y} Tm (${escapePdfText(line.text)}) Tj`);
    } else {
      commands.push(textCommand(line.text, MARGIN_X, y, size, false));
    }
    y -= LINE_HEIGHT + Math.max(0, size - 9) * 0.65;
  }

  commands.push(lineCommand(MARGIN_X, FOOTER_Y + 18, MARGIN_X + CONTENT_WIDTH, FOOTER_Y + 18, BORDER, 0.6));
  commands.push(`${MUTED} rg /FR 7.5 Tf 1 0 0 1 ${MARGIN_X} ${FOOTER_Y} Tm (Viara  ·  ${escapePdfText(data.otsikko)}) Tj`);
  commands.push(`${MUTED} rg /FR 7.5 Tf 1 0 0 1 ${PAGE_WIDTH - MARGIN_X - 62} ${FOOTER_Y} Tm (Sivu ${pageIndex + 1} / ${pageCount}) Tj`);
  commands.push("Q");
  return commands.join("\n");
}

function asciiBytes(text: string) {
  return new TextEncoder().encode(text);
}

function objectBytes(parts: (string | Uint8Array)[]) {
  const encoded = parts.map((part) => (typeof part === "string" ? asciiBytes(part) : part));
  const length = encoded.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  for (const part of encoded) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

export function muodostaRaporttiPdf(data: PdfRaportti) {
  const lines = buildLines(data);
  const pageCount = Math.max(1, Math.ceil(lines.length / MAX_LINES));
  const objects: Uint8Array[] = [];
  const offsets: number[] = [];

  objects.push(objectBytes(["<< /Type /Catalog /Pages 2 0 R >>"]));
  const pageObjectIds = Array.from({ length: pageCount }, (_, index) => 5 + index * 2);
  const kids = pageObjectIds.map((id) => `${id} 0 R`).join(" ");
  objects.push(objectBytes([`<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>`]));
  objects.push(objectBytes(["<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"]));
  objects.push(objectBytes(["<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"]));

  for (let i = 0; i < pageCount; i++) {
    const pageId = 5 + i * 2;
    const contentId = pageId + 1;
    const pageLines = lines.slice(i * MAX_LINES, i * MAX_LINES + MAX_LINES);
    const stream = winAnsi(makePage(data, pageLines, i, pageCount));
    const pageDictionary = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /FR 3 0 R /FB 4 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects.push(objectBytes([pageDictionary]));
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
  const xref = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    `${xrefOffset}`,
    "%%EOF",
  ].join("\n");
  chunks.push(asciiBytes(`${xref}\n`));

  const resultLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(resultLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}
