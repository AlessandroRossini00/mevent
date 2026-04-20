"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function toNullable(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
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
      visibility: String(formData.get("visibility") ?? "public"),
      approval_mode: String(formData.get("approval_mode") ?? "open"),
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

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("approval_mode")
    .eq("id", eventId)
    .single();

  if (eventError) throw eventError;

  if (event.approval_mode === "approval_required") {
    const { error } = await supabase.from("event_join_requests").upsert(
      {
        event_id: eventId,
        user_id: user.id,
        status: "pending",
      },
      { onConflict: "event_id,user_id" },
    );

    if (error) throw error;

    return { type: "request_sent" as const };
  }

  const { error } = await supabase.from("event_members").upsert(
    {
      event_id: eventId,
      user_id: user.id,
      role: "member",
    },
    { onConflict: "event_id,user_id" },
  );

  if (error) throw error;

  return { type: "joined" as const };
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
