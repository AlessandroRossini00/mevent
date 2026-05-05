// Generato con AI
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthActionState } from "./types";
import { getPostAuthRedirect } from "./redirect-after-auth";

const REDIRECT_AFTER_LOGIN = "/explore";
const CALLBACK_PATH = "/api/auth/callback";

// TODO credo modificare _prevState che credo sia inutile
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

  redirect(await getPostAuthRedirect(data.user.id));
}

export async function loginWithGoogle(): Promise<never> {
  console.log("GOOGLE");
  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "http://192.168.1.44:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}${CALLBACK_PATH}?next=${REDIRECT_AFTER_LOGIN}`,
    },
  });

  if (error) redirect(`/login?message=${encodeURIComponent(error.message)}`);
  if (!data.url) redirect("/login?message=Impossibile avviare login Google.");

  console.log(data.url);
  // Redirect verso Google
  // Quando finisce, Google torna a Supabase (...supabase.co/auth/v1/callback).
  // Supabase reindirizza a http://localhost:3000/api/auth/callback?code=...&next=/explore.
  redirect(data.url);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
