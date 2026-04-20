"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function toNullable(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const username = toNullable(formData.get("username"));
  const fullName = String(formData.get("full_name") ?? "").trim();
  const birthDate = toNullable(formData.get("birth_date"));
  const bio = toNullable(formData.get("bio"));
  const city = toNullable(formData.get("city"));

  if (!fullName) {
    throw new Error("Il nome completo è obbligatorio.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      full_name: fullName,
      birth_date: birthDate,
      bio,
      city,
    })
    .eq("id", user.id);

  if (error) {
    if (
      error.code === "23505" &&
      error.message.includes("profiles_username_key")
    ) {
      throw new Error("Username gia in uso.");
    }

    throw error;
  }

  return { success: true };
}

export async function deleteCreatedEventAction(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("creator_id", user.id);

  if (error) throw error;

  return { success: true };
}
