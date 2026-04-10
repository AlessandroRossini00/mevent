// Generato con AI
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createNewUserProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const username = String(formData.get("username") ?? "").trim() || null;
  const fullName = String(formData.get("fullName") ?? "").trim();
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const avatar = formData.get("avatar") as File | null;

  if (!fullName) redirect("/new-user?message=Inserisci il nome.");
  if (!birthDate) redirect("/new-user?message=Inserisci la data di nascita.");
  if (!avatar || avatar.size === 0) {
    redirect("/new-user?message=Inserisci l'immagine.");
  }

  // Controllo esistenza di username dupplici
  if (username) {
    const { data: existingUsername } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existingUsername) {
      redirect("/new-user?message=Username gia in uso.");
    }
  }

  let avatarUrl: string | null = null;
  let uploadedPath: string | null = null;

  if (avatar.size > 0) {
    const ext = avatar.name.split(".").pop() || "jpg";
    uploadedPath = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatar-images")
      .upload(uploadedPath, avatar, { upsert: false });

    if (uploadError) {
      redirect(`/new-user?message=${encodeURIComponent(uploadError.message)}`);
    }

    const { data } = supabase.storage
      .from("avatar-images")
      .getPublicUrl(uploadedPath);

    avatarUrl = data.publicUrl;
  }

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    username,
    full_name: fullName,
    birth_date: birthDate,
    avatar_url: avatarUrl,
    bio,
    city,
  });

  if (error) {
    if (uploadedPath) {
      await supabase.storage.from("avatar-images").remove([uploadedPath]);
    }

    // Nel caso di username dupplici
    if (
      error.code === "23505" &&
      error.message.includes("profiles_username_key")
    ) {
      redirect("/new-user?message=Username gia in uso.");
    }

    redirect("/new-user?message=Errore durante la creazione del profilo.");
  }

  redirect("/explore");
}
