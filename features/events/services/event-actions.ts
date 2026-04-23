"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function toNullable(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function toNullableNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;

  const num = Number(text);
  return Number.isNaN(num) ? null : num;
}

export async function createEventAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const eventAt = String(formData.get("event_at") ?? "").trim();

  if (!title) redirect("/events/new?message=Inserisci il titolo.");
  if (!eventAt) redirect("/events/new?message=Inserisci data e ora.");

  const { data, error } = await supabase
    .from("events")
    .insert({
      creator_id: user.id,
      title,
      description: toNullable(formData.get("description")),
      category: toNullable(formData.get("category")),
      event_at: eventAt,
      location_name: toNullable(formData.get("location_name")),
      address: toNullable(formData.get("address")),
      latitude: formData.get("latitude")
        ? Number(formData.get("latitude"))
        : null,
      longitude: formData.get("longitude")
        ? Number(formData.get("longitude"))
        : null,
      price: formData.get("price") ? Number(formData.get("price")) : 0,
      website_url: toNullable(formData.get("website_url")),
      maps_url: toNullable(formData.get("maps_url")),
      max_members: formData.get("max_members")
        ? Number(formData.get("max_members"))
        : null,
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/events/new?message=${encodeURIComponent(error.message)}`);
  }

  const { error: memberError } = await supabase.from("event_members").insert({
    event_id: data.id,
    user_id: user.id,
    role: "admin",
  });

  if (memberError) {
    redirect(`/events/new?message=${encodeURIComponent(memberError.message)}`);
  }

  redirect(`/events/${data.id}`);
}

export async function joinEventAction(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error: joinError } = await supabase.from("event_members").upsert(
    {
      event_id: eventId,
      user_id: user.id,
      role: "member",
    },
    { onConflict: "event_id,user_id" },
  );

  if (joinError) throw joinError;

  const { data: joinedEvent, error: joinedEventError } = await supabase
    .from("events")
    .select(
      `
      *,
      event_images (*),
      event_members (
        event_id,
        user_id,
        role,
        joined_at,
        profile:user_id (
          id,
          username,
          full_name,
          birth_date,
          avatar_url,
          bio,
          city
        )
      )
    `,
    )
    .eq("id", eventId)
    .maybeSingle();

  if (joinedEventError) throw joinedEventError;

  if (!joinedEvent) {
    throw new Error("Evento non trovato.");
  }

  return {
    type: "joined" as const,
    event: joinedEvent,
  };
}

export async function leaveJoinedEventAction(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("creator_id")
    .eq("id", eventId)
    .single();

  if (eventError) throw eventError;

  if (event.creator_id === user.id) {
    throw new Error(
      "Il creator non puo lasciare l'evento. Elimina l'evento oppure trasferisci la ownership.",
    );
  }

  const { error } = await supabase
    .from("event_members")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  if (error) throw error;

  return { success: true };
}

export async function deleteEventAction(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, creator_id")
    .eq("id", eventId)
    .single();

  if (eventError) throw eventError;

  if (event.creator_id !== user.id) {
    throw new Error("Solo il creator puo eliminare questo evento.");
  }

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("creator_id", user.id);

  if (error) throw error;

  return { success: true };
}

export async function updateEventAction(eventId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const description = toNullable(formData.get("description"));
  const category = toNullable(formData.get("category"));
  const eventAt = String(formData.get("event_at") ?? "").trim();
  const locationName = toNullable(formData.get("location_name"));
  const address = toNullable(formData.get("address"));
  const latitude = toNullableNumber(formData.get("latitude"));
  const longitude = toNullableNumber(formData.get("longitude"));
  const price = toNullableNumber(formData.get("price")) ?? 0;
  const maxMembers = toNullableNumber(formData.get("max_members"));
  const websiteUrl = toNullable(formData.get("website_url"));
  const mapsUrl = toNullable(formData.get("maps_url"));

  if (!title) {
    throw new Error("Il titolo e obbligatorio.");
  }

  if (!eventAt) {
    throw new Error("La data dell'evento e obbligatoria.");
  }

  const { data: existingEvent, error: existingEventError } = await supabase
    .from("events")
    .select("id, creator_id")
    .eq("id", eventId)
    .maybeSingle();

  if (existingEventError) throw existingEventError;

  if (!existingEvent) {
    throw new Error("Evento non trovato.");
  }

  if (existingEvent.creator_id !== user.id) {
    throw new Error("Non puoi modificare questo evento.");
  }

  const { error } = await supabase
    .from("events")
    .update({
      title,
      description,
      category,
      event_at: new Date(eventAt).toISOString(),
      location_name: locationName,
      address,
      latitude,
      longitude,
      price,
      max_members: maxMembers,
      website_url: websiteUrl,
      maps_url: mapsUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .eq("creator_id", user.id);

  if (error) throw error;

  const { data: updatedEvent, error: updatedEventError } = await supabase
    .from("events")
    .select(
      `
      *,
      event_images (*),
      event_members (
        event_id,
        user_id,
        role,
        joined_at,
        profile:user_id (
          id,
          username,
          full_name,
          birth_date,
          avatar_url,
          bio,
          city
        )
      )
    `,
    )
    .eq("id", eventId)
    .maybeSingle();

  if (updatedEventError) throw updatedEventError;

  return updatedEvent;
}
