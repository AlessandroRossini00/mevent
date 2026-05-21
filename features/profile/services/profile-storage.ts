import { createClient } from "@/lib/supabase/server";

export function extractAvatarPath(publicUrl: string | null) {
  if (!publicUrl) return null;

  // Dalla public URL ricaviamo il path interno nello storage,
  // utile per poter eliminare o sostituire il file in un secondo momento.
  const marker = "/storage/v1/object/public/avatar-images/";
  const index = publicUrl.indexOf(marker);

  if (index === -1) return null;

  return publicUrl.slice(index + marker.length);
}

export function getAvatarPath(userId: string) {
  // Manteniamo un path stabile per utente, così il nuovo avatar
  // può sostituire direttamente il precedente.
  return `${userId}/avatar.jpg`;
}

export async function uploadAvatar(userId: string, avatar: File) {
  const supabase = await createClient();
  const uploadedPath = getAvatarPath(userId);

  const { error: uploadError } = await supabase.storage
    .from("avatar-images")
    .upload(uploadedPath, avatar, {
      // upsert permette di aggiornare l'avatar esistente senza creare
      // file duplicati per lo stesso utente.
      upsert: true,
      contentType: "image/jpeg",
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error("Errore upload immagine profilo.");
  }

  const { data: publicUrlData } = supabase.storage
    .from("avatar-images")
    .getPublicUrl(uploadedPath);

  return {
    uploadedPath,
    publicUrl: publicUrlData.publicUrl,
  };
}

export async function removeAvatar(path: string) {
  const supabase = await createClient();

  // La rimozione viene usata sia per pulire file non più validi
  // sia come rollback quando un aggiornamento fallisce.
  await supabase.storage.from("avatar-images").remove([path]);
}
