import { createClient } from "@/lib/supabase/client";
import type { EventImage } from "@/features/events/services/types";

export async function uploadEventImage(eventId: string, file: File) {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${eventId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("event-images")
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("event-images").getPublicUrl(path);

  return {
    path,
    imageUrl: data.publicUrl,
  };
}

export async function saveEventImageRecord(
  eventId: string,
  imageUrl: string,
): Promise<EventImage> {
  const supabase = createClient();

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
