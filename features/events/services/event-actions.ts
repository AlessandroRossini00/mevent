"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EVENT_CATEGORIES, EVENT_LIMITS, MAX_USER_EVENTS } from "../constants";

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

async function getUserEventsCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { count, error } = await supabase
    .from("event_members")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;

  return count ?? 0;
}

async function assertUserCanAddEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const count = await getUserEventsCount(supabase, userId);

  if (count >= MAX_USER_EVENTS) {
    throw new Error(
      `Hai raggiunto il limite massimo di ${MAX_USER_EVENTS} eventi.`,
    );
  }
}

function validateEventInput(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = toNullable(formData.get("description"));
  const category = String(formData.get("category") ?? "").trim();
  const eventAt = String(formData.get("event_at") ?? "").trim();

  const locationName = toNullable(formData.get("location_name"));
  const address = toNullable(formData.get("address"));
  const latitude = toNullableNumber(formData.get("latitude"));
  const longitude = toNullableNumber(formData.get("longitude"));
  const rawMapsUrl = toNullable(formData.get("maps_url"));

  const price = toNullableNumber(formData.get("price")) ?? 0;
  const maxMembers = toNullableNumber(formData.get("max_members"));

  if (!title) {
    throw new Error("Il titolo è obbligatorio.");
  }

  if (title.length > EVENT_LIMITS.title) {
    throw new Error(
      `Il titolo non può superare ${EVENT_LIMITS.title} caratteri.`,
    );
  }

  if (description && description.length > EVENT_LIMITS.description) {
    throw new Error(
      `La descrizione non può superare ${EVENT_LIMITS.description} caratteri.`,
    );
  }

  if (
    !EVENT_CATEGORIES.includes(category as (typeof EVENT_CATEGORIES)[number])
  ) {
    throw new Error("Categoria non valida.");
  }

  if (!eventAt) {
    throw new Error("La data e ora è obbligatoria.");
  }

  const parsedDate = new Date(eventAt);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Data e ora non valide.");
  }

  if (maxMembers !== null) {
    if (maxMembers < 1) {
      throw new Error("Il numero massimo di membri deve essere almeno 1.");
    }

    if (maxMembers > EVENT_LIMITS.maxMembers) {
      throw new Error(
        `Il numero massimo di membri non può superare ${EVENT_LIMITS.maxMembers}.`,
      );
    }
  }

  if (price < 0) {
    throw new Error("Il prezzo non può essere negativo.");
  }

  const mapsUrl =
    latitude !== null && longitude !== null
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : rawMapsUrl;

  return {
    title,
    description,
    category,
    eventAt,
    locationName,
    address,
    latitude,
    longitude,
    price,
    maxMembers,
    mapsUrl,
  };
}

export async function createEventAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await assertUserCanAddEvent(supabase, user.id);

  const input = validateEventInput(formData);

  const { data, error } = await supabase
    .from("events")
    .insert({
      creator_id: user.id,
      title: input.title,
      description: input.description,
      category: input.category,
      event_at: input.eventAt,
      location_name: input.locationName,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      price: input.price,
      maps_url: input.mapsUrl,
      max_members: input.maxMembers,
      status: "active",
    })
    .select("id")
    .single();

  if (error) throw error;

  const { error: memberError } = await supabase.from("event_members").insert({
    event_id: data.id,
    user_id: user.id,
    role: "admin",
  });

  if (memberError) throw memberError;

  return { eventId: data.id };
}
export async function joinEventAction(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: existingMember, error: existingMemberError } = await supabase
    .from("event_members")
    .select("event_id, user_id, role")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMemberError) throw existingMemberError;

  if (!existingMember) {
    await assertUserCanAddEvent(supabase, user.id);

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, max_members")
      .eq("id", eventId)
      .maybeSingle();

    if (eventError) throw eventError;
    if (!event) throw new Error("Evento non trovato.");

    if (event.max_members !== null) {
      const { count, error: countError } = await supabase
        .from("event_members")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId);

      if (countError) throw countError;

      if ((count ?? 0) >= event.max_members) {
        throw new Error("Questo evento è già pieno.");
      }
    }

    const { error: joinError } = await supabase.from("event_members").insert({
      event_id: eventId,
      user_id: user.id,
      role: "member",
    });

    if (joinError) throw joinError;
  }

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
  if (!joinedEvent) throw new Error("Evento non trovato.");

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

  const input = validateEventInput(formData);

  const { data: existingEvent, error: existingEventError } = await supabase
    .from("events")
    .select("id, creator_id")
    .eq("id", eventId)
    .maybeSingle();

  if (existingEventError) throw existingEventError;
  if (!existingEvent) throw new Error("Evento non trovato.");
  if (existingEvent.creator_id !== user.id) {
    throw new Error("Non puoi modificare questo evento.");
  }

  const { error } = await supabase
    .from("events")
    .update({
      title: input.title,
      description: input.description,
      category: input.category,
      event_at: input.eventAt,
      location_name: input.locationName,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      price: input.price,
      maps_url: input.mapsUrl,
      max_members: input.maxMembers,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .eq("creator_id", user.id);

  if (error) throw error;

  return { eventId };
}
