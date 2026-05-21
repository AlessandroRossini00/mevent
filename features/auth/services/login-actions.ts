"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthActionState } from "./types";
import { getPostAuthRedirect } from "./redirect-after-auth";

const REDIRECT_AFTER_LOGIN = "/explore";
const CALLBACK_PATH = "/api/auth/callback";

export async function login(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };

  // Dopo il login classico decidiamo la destinazione finale in base
  // allo stato del profilo utente (es. onboarding o app principale).
  redirect(await getPostAuthRedirect(data.user.id));
}

export async function loginWithGoogle(): Promise<never> {
  const supabase = await createClient();

  const requestOrigin = (await headers()).get("origin");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const origin = requestOrigin ?? appUrl;

  // In produzione usiamo un origin affidabile per costruire
  // il redirect OAuth di ritorno verso l'app.
  if (!origin) {
    redirect("/login?message=URL applicazione non configurato.");
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // Dopo il passaggio su Google/Supabase torniamo alla callback interna,
      // che completerà la sessione e poi reindirizzerà verso il next richiesto.
      redirectTo: `${origin}${CALLBACK_PATH}?next=${REDIRECT_AFTER_LOGIN}`,
    },
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  if (!data.url) {
    redirect("/login?message=Impossibile avviare login Google.");
  }

  // Questo redirect porta l'utente fuori dall'app verso il flusso OAuth Google.
  redirect(data.url);
}

export async function logout() {
  const supabase = await createClient();

  // Chiudiamo la sessione Supabase e riportiamo l'utente
  // alla schermata di login.
  await supabase.auth.signOut();
  redirect("/login");
}
