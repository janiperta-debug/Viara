"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const BUCKET = "profile-avatars";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function lataaProfiilikuva(formData: FormData) {
  const file = formData.get("kuva");
  if (!(file instanceof File) || file.size === 0) return;

  if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_SIZE) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });

  if (uploadError) return;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });

  revalidatePath("/asiakas/profiili");
  revalidatePath("/asiakas");
}
