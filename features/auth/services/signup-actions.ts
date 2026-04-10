// Generato con AI
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthActionState } from "./types";
import { getPostAuthRedirect } from "./redirect-after-auth";

const CALLBACK_PATH = "/api/auth/callback";
const REDIRECT_AFTER_CONFIRM = "/new-user"; // oppure explore

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
      emailRedirectTo: `${origin}${CALLBACK_PATH}?next=${REDIRECT_AFTER_CONFIRM}`,
    },
  });

  if (error) return { error: error.message };

  redirect("/new-user");
  return { success: "Controlla la tua email per confermare l'account." };
}
