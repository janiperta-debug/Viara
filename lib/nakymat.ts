export type ViaraRooli =
  | "admin"
  | "asiakas"
  | "kuljettaja"
  | "tyonjohto";

export type NakymaLinkki = {
  href: string;
  label: string;
};

const NAKYMAT_ROOLEITTAIN: Record<
  ViaraRooli,
  readonly NakymaLinkki[]
> = {
  admin: [],
  asiakas: [{ href: "/asiakas", label: "Asiakas" }],
  kuljettaja: [{ href: "/tyo", label: "Työ" }],
  tyonjohto: [
    { href: "/tyo", label: "Työ" },
    { href: "/tyonjohto", label: "Työnjohto" },
    { href: "/asiakas", label: "Asiakas" },
  ],
};

export function onViaraRooli(arvo: string): arvo is ViaraRooli {
  return arvo in NAKYMAT_ROOLEITTAIN;
}

export function sallitutNakymat(rooli: ViaraRooli): readonly NakymaLinkki[] {
  return NAKYMAT_ROOLEITTAIN[rooli];
}

export function voikoVaihtaaNakymaa(rooli: ViaraRooli): boolean {
  return sallitutNakymat(rooli).length > 1;
}
