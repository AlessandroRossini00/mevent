import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TabsClientLayout from "@/components/layout/tabs-client";

export default async function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <TabsClientLayout>{children}</TabsClientLayout>;
}
