"use server";

import { kirjaaTapahtuma } from "@/lib/events";

type AsetaTyovalineInput = {
  tyovalinetyyppiId: string;
  aktiivinen: boolean;
};

export async function asetaTyovaline({
  tyovalinetyyppiId,
  aktiivinen,
}: AsetaTyovalineInput) {
  if (!tyovalinetyyppiId) {
    return {
      success: false,
      error: "Työvälinetyypin ID puuttuu.",
    };
  }

  const tapahtuma = await kirjaaTapahtuma({
    tyyppi: aktiivinen
      ? "tyovaline_on"
      : "tyovaline_off",
    tyovalinetyyppiId,
  });

  if (!tapahtuma.success) {
    return {
      success: false,
      error: tapahtuma.error,
    };
  }

  return {
    success: true,
    tapahtuma: tapahtuma.tapahtuma,
  };
}