"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NAKYMA_COOKIE } from "@/lib/nakyma-cookie";

// Pienin mahdollinen uloskirjautuminen olemassa olevalla
// Supabase-server-clientilla. Ei uutta autentikaatiojärjestelmää.
export async function kirjauduUlos() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  // Poistetaan allekirjoitettu näkymäeväste uloskirjautuessa.
  const cookieStore = await cookies();
  cookieStore.delete(NAKYMA_COOKIE);

  redirect("/kirjaudu");
}
