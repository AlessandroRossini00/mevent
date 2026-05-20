import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NewUserForm from "@/features/auth/components/new-user-form";

export default async function NewUserPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) redirect("/explore");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <NewUserForm message={params.message} />
      </div>
    </main>
  );
}
