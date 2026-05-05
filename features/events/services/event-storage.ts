import { createClient } from "@/lib/supabase/client";
import type { EventImage } from "@/features/events/services/types";

function getEventImagePath(eventId: string) {
  return `${eventId}/cover`;
}

export async function uploadEventImage(eventId: string, file: File) {
  const supabase = createClient();
  const path = getEventImagePath(eventId);

  const { error: removeError } = await supabase.storage
    .from("event-images")
    .remove([path]);

  if (removeError) {
    // non bloccare se il file non esiste già
    console.warn("Storage remove warning:", removeError.message);
  }

  const { error } = await supabase.storage
    .from("event-images")
    .upload(path, file, {
      upsert: true,
      contentType: file.type || undefined,
      cacheControl: "0",
    });

  if (error) throw error;

  const { data } = supabase.storage.from("event-images").getPublicUrl(path);

  return {
    path,
    imageUrl: `${data.publicUrl}?t=${Date.now()}`,
  };
}

export async function saveEventImageRecord(
  eventId: string,
  imageUrl: string,
): Promise<EventImage> {
  const supabase = createClient();

  const { error: deleteError } = await supabase
    .from("event_images")
    .delete()
    .eq("event_id", eventId);

  if (deleteError) throw deleteError;

  const { data, error } = await supabase
    .from("event_images")
    .insert({
      event_id: eventId,
      image_url: imageUrl,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data as EventImage;
}
