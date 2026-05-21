"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendPushToUsers } from "@/features/pwa/services/send-push";

type SubscriptionInput = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export async function subscribeUser(subscription: SubscriptionInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Le subscription push sono sempre associate a un utente autenticato:
  // se la sessione non esiste rimandiamo al login.
  if (!user) redirect("/login");

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    // L'endpoint identifica in modo univoco la subscription del device/browser:
    // con upsert evitiamo duplicati e aggiorniamo eventuali chiavi cambiate.
    { onConflict: "endpoint" },
  );

  if (error) throw error;

  return { success: true };
}

export async function unsubscribeUser(endpoint: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Anche la rimozione è limitata all'utente autenticato, così non possiamo
  // cancellare subscription appartenenti ad altri account.
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  if (error) throw error;

  return { success: true };
}

export async function sendNotification(message: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // La notifica di test viene inviata solo all'utente corrente,
  // usando le subscription già salvate nel database.
  if (!user) redirect("/login");

  await sendPushToUsers([user.id], {
    title: "Test Notification",
    body: message || "Notifica di prova",
    url: "/",
    icon: "/icons/icon-256.png",
    badge: "/icons/icon-256.png",
  });

  return { success: true };
}
