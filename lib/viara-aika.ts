export const VIARA_AI_KAYTTOKOHTEET = {
  aikaVyohyke: "Europe/Helsinki",
  locale: "fi-FI",
} as const;

export function muotoileViaraAika(
  aikaleima: string | Date,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return new Intl.DateTimeFormat(VIARA_AI_KAYTTOKOHTEET.locale, {
    timeZone: VIARA_AI_KAYTTOKOHTEET.aikaVyohyke,
    ...options,
  }).format(new Date(aikaleima));
}

export function muotoileViaraPaivamaara(aikaleima: string | Date): string {
  return muotoileViaraAika(aikaleima, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function muotoileViaraKellonaika(aikaleima: string | Date): string {
  return muotoileViaraAika(aikaleima, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
