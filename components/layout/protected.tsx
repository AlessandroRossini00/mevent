import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Serve per verificare in tutta app se l'utente è loggato
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  return <>{children}</>;
}
