import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPostAuthRedirect } from "@/features/auth/services/redirect-after-auth";

//TODO chiedere a gpt di spiegarlo
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/login?message=Sessione non valida", request.url),
    );
  }

  const next = await getPostAuthRedirect(user.id);
  return NextResponse.redirect(new URL(next, request.url));
}
