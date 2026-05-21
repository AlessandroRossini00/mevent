"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PROFILE_LIMITS } from "@/features/profile/services/constants";
import {
  extractAvatarPath,
  removeAvatar,
  uploadAvatar,
} from "@/features/profile/services/profile-storage";

function toNullable(value: FormDataEntryValue | null) {
  // I campi opzionali vuoti vengono convertiti in null
  // per mantenere il dato più coerente nel database.
  const text = String(value ?? "").trim();
  return text || null;
}

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // L'aggiornamento del profilo è disponibile solo per utenti autenticati.
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

  // Leggiamo l'avatar attuale prima dell'update per capire se,
  // dopo un nuovo upload, dovremo rimuovere il file precedente.
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
    const uploaded = await uploadAvatar(user.id, avatar);
    uploadedPath = uploaded.uploadedPath;
    nextAvatarUrl = uploaded.publicUrl;
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
    // Se il database fallisce dopo aver caricato un nuovo avatar,
    // rimuoviamo il file appena salvato per evitare immagini orfane nello storage.
    if (uploadedPath) {
      await removeAvatar(uploadedPath);
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

  // Se l'update è andato a buon fine e abbiamo caricato un nuovo avatar,
  // possiamo eliminare quello vecchio senza rischiare di perdere l'immagine attiva.
  if (uploadedPath && oldAvatarPath) {
    await removeAvatar(oldAvatarPath);
  }

  return {
    success: true,
    avatar_url: nextAvatarUrl,
  };
}
