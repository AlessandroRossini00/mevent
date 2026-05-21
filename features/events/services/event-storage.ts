import { createClient } from "@/lib/supabase/client";
import type { EventImage } from "@/features/events/services/types";

function getEventImagePath(eventId: string) {
  // Usiamo un path stabile per la cover dell'evento,
  // così ogni nuovo upload sostituisce la precedente.
  return `${eventId}/cover`;
}

export async function uploadEventImage(eventId: string, file: File) {
  const supabase = createClient();
  const path = getEventImagePath(eventId);

  const { error: removeError } = await supabase.storage
    .from("event-images")
    .remove([path]);

  if (removeError) {
    // La rimozione preventiva serve a pulire eventuali file precedenti.
    // Se però il file non esiste già non blocchiamo il flusso di upload.
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

    // Aggiungiamo un timestamp alla URL pubblica per forzare il refresh
    // della cache quando la cover viene sostituita.
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

  // Manteniamo un solo record immagine per evento:
  // prima cancelliamo quello esistente, poi salviamo quello nuovo.
  return data as EventImage;
}
