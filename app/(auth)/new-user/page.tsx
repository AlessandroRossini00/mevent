// Generato AI
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createNewUserProfile } from "@/features/auth/services/new-user-actions";

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
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Completa il tuo profilo</h1>

      <form
        action={createNewUserProfile}
        className="space-y-4 rounded-xl border p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">Username</label>
          <input
            name="username"
            required
            className="w-full rounded-lg border px-3 py-2"
            placeholder="mario.rossi"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Nome</label>
          <input
            name="fullName"
            required
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Mario Rossi"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Data di nascita
          </label>
          <input
            name="birthDate"
            type="date"
            required
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Città</label>
          <input
            name="city"
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Milano"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Bio</label>
          <textarea
            name="bio"
            rows={4}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Scrivi qualcosa su di te"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Foto profilo</label>
          <input
            name="avatar"
            type="file"
            accept="image/*"
            required
            className="w-full"
          />
        </div>

        <button className="w-full rounded-lg bg-black px-4 py-2 text-white">
          Conferma
        </button>

        {params.message ? (
          <p className="text-sm text-red-600">{params.message}</p>
        ) : null}
      </form>
    </main>
  );
}
