"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// Pienin mahdollinen uloskirjautuminen olemassa olevalla
// Supabase-server-clientilla. Ei uutta autentikaatiojärjestelmää.
export async function kirjauduUlos() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/kirjaudu");
}
