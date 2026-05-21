import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPostAuthRedirect } from "@/features/auth/services/redirect-after-auth";

// Questa route è il punto di rientro del flusso di autenticazione:
// dopo login OAuth o conferma email riceve il code da Supabase
// e completa la sessione lato applicazione.
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  const supabase = await createClient();

  if (code) {
    // Il code ricevuto nella callback viene scambiato con una sessione valida
    // che verrà poi letta dai successivi getUser/getSession.
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Se dopo lo scambio non esiste un utente valido,
  // consideriamo il flusso auth non completato correttamente.
  if (!user) {
    return NextResponse.redirect(
      new URL("/login?message=Sessione non valida", request.url),
    );
  }

  // La destinazione finale dipende dallo stato utente/profilo:
  // per esempio onboarding se il profilo manca, altrimenti area principale.
  const next = await getPostAuthRedirect(user.id);
  return NextResponse.redirect(new URL(next, request.url));
}
