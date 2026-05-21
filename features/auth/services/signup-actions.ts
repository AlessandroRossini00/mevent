"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthActionState } from "./types";

const CALLBACK_PATH = "/api/auth/callback";

// Dopo la conferma email vogliamo portare l'utente nel flusso
// di completamento profilo/onboarding.
const REDIRECT_AFTER_CONFIRM = "/new-user";

export async function signup(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Supabase userà questa callback dopo la conferma:
      // da lì l'app potrà leggere la sessione e poi inoltrare al next desiderato.
      emailRedirectTo: `${origin}${CALLBACK_PATH}?next=${REDIRECT_AFTER_CONFIRM}`,
    },
  });

  if (error) return { error: error.message };

  // Dopo il submit portiamo subito l'utente nella schermata onboarding.
  // In questo progetto il flusso è pensato per completare il profilo subito dopo signup.
  redirect("/new-user");
}
