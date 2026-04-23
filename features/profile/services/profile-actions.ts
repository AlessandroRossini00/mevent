"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function toNullable(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function extractAvatarPath(publicUrl: string | null) {
  if (!publicUrl) return null;

  const marker = "/storage/v1/object/public/avatar-images/";
  const index = publicUrl.indexOf(marker);

  if (index === -1) return null;

  return publicUrl.slice(index + marker.length);
}

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const username = toNullable(formData.get("username"));
  const fullName = String(formData.get("full_name") ?? "").trim();
  const birthDate = toNullable(formData.get("birth_date"));
  const bio = toNullable(formData.get("bio"));
  const city = toNullable(formData.get("city"));
  const avatar = formData.get("avatar") as File | null;

  if (!fullName) {
    throw new Error("Il nome completo è obbligatorio.");
  }

  const { data: currentProfile, error: currentProfileError } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  if (currentProfileError) {
    throw new Error("Impossibile leggere il profilo attuale.");
  }

  let nextAvatarUrl = currentProfile.avatar_url ?? null;
  let uploadedPath: string | null = null;

  if (avatar && avatar.size > 0) {
    const ext = avatar.name.split(".").pop()?.toLowerCase() || "jpg";
    uploadedPath = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatar-images")
      .upload(uploadedPath, avatar, {
        upsert: false,
        contentType: avatar.type || undefined,
      });

    if (uploadError) {
      throw new Error("Errore upload immagine profilo.");
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatar-images")
      .getPublicUrl(uploadedPath);

    nextAvatarUrl = publicUrlData.publicUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      full_name: fullName,
      birth_date: birthDate,
      bio,
      city,
      avatar_url: nextAvatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    if (uploadedPath) {
      await supabase.storage.from("avatar-images").remove([uploadedPath]);
    }

    if (
      error.code === "23505" &&
      error.message.includes("profiles_username_key")
    ) {
      throw new Error("Username gia in uso.");
    }

    throw error;
  }

  const oldAvatarPath = extractAvatarPath(currentProfile.avatar_url);

  if (uploadedPath && oldAvatarPath) {
    await supabase.storage.from("avatar-images").remove([oldAvatarPath]);
  }

  return {
    success: true,
    avatar_url: nextAvatarUrl,
  };
}

export async function deleteCreatedEventAction(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("creator_id", user.id);

  if (error) throw error;

  return { success: true };
}
