import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditEventForm from "@/features/events/components/edit-event-form";

type EditEventPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: event, error } = await supabase
    .from("events")
    .select(
      `
      *,
      event_images (*),
      event_members (
        event_id,
        user_id,
        role,
        joined_at,
        profile:user_id (
          id,
          username,
          full_name,
          birth_date,
          avatar_url,
          bio,
          city
        )
      )
    `,
    )
    .eq("id", id)
    .eq("creator_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!event) {
    redirect("/profile");
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <EditEventForm event={event} />
    </main>
  );
}
