"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PROFILE_LIMITS } from "@/features/profile/services/constants";

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

  const username = String(formData.get("username") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const birthDate = String(formData.get("birth_date") ?? "").trim();
  const bio = toNullable(formData.get("bio"));
  const city = String(formData.get("city") ?? "").trim();
  const avatar = formData.get("avatar") as File | null;

  if (!username) {
    throw new Error("Lo username è obbligatorio.");
  }

  if (!fullName) {
    throw new Error("Il nome completo è obbligatorio.");
  }

  if (!birthDate) {
    throw new Error("La data di nascita è obbligatoria.");
  }

  if (!city) {
    throw new Error("La città è obbligatoria.");
  }

  if (fullName.length > PROFILE_LIMITS.fullName) {
    throw new Error(
      `Il nome completo non può superare ${PROFILE_LIMITS.fullName} caratteri.`,
    );
  }

  if (username.length > PROFILE_LIMITS.username) {
    throw new Error(
      `Lo username non può superare ${PROFILE_LIMITS.username} caratteri.`,
    );
  }

  if (city.length > PROFILE_LIMITS.city) {
    throw new Error(
      `La città non può superare ${PROFILE_LIMITS.city} caratteri.`,
    );
  }

  if (bio && bio.length > PROFILE_LIMITS.bio) {
    throw new Error(`La bio non può superare ${PROFILE_LIMITS.bio} caratteri.`);
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
