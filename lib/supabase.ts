import { createClient } from "@supabase/supabase-js";

/**
 * Viaran yhteinen Supabase-client.
 *
 * Tätä käytetään kaikissa Server Actioneissa.
 * Yhteys muodostetaan .env.local -tiedoston
 * ympäristömuuttujien perusteella.
 */

// Luetaan ympäristömuuttujat
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Tarkistetaan, että ne löytyvät
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables are missing. Check your .env.local file."
  );
}

// Luodaan yhteinen Supabase-client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);