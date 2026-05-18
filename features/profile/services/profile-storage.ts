import { createClient } from "@/lib/supabase/server";

export function extractAvatarPath(publicUrl: string | null) {
  if (!publicUrl) return null;

  const marker = "/storage/v1/object/public/avatar-images/";
  const index = publicUrl.indexOf(marker);

  if (index === -1) return null;

  return publicUrl.slice(index + marker.length);
}

export function getAvatarPath(userId: string) {
  return `${userId}/avatar.jpg`;
}

export async function uploadAvatar(userId: string, avatar: File) {
  const supabase = await createClient();
  const uploadedPath = getAvatarPath(userId);

  const { error: uploadError } = await supabase.storage
    .from("avatar-images")
    .upload(uploadedPath, avatar, {
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
  await supabase.storage.from("avatar-images").remove([path]);
}
