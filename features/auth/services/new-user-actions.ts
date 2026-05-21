"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createNewUserProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Il completamento profilo è consentito solo a un utente autenticato.
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

  // Se lo username è stato inserito, controlliamo in anticipo
  // che non sia già occupato da un altro profilo.
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

    // L'immagine viene caricata prima dell'insert profilo,
    // così possiamo salvare subito la public URL nel record finale.
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
      // Se il profilo fallisce dopo l'upload dell'avatar,
      // rimuoviamo il file appena caricato per evitare risorse orfane nello storage.
      await supabase.storage.from("avatar-images").remove([uploadedPath]);
    }

    // Gestiamo esplicitamente anche il caso in cui la duplicazione username
    // venga intercettata solo dal vincolo database.
    if (
      error.code === "23505" &&
      error.message.includes("profiles_username_key")
    ) {
      redirect("/new-user?message=Username gia in uso.");
    }

    redirect("/new-user?message=Errore durante la creazione del profilo.");
  }

  // Una volta completato il profilo portiamo l'utente nell'app principale.
  redirect("/explore");
}
