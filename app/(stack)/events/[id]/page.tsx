import EventDetailClient from "@/features/events/components/event-detail-client";

type EventDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;
  return <EventDetailClient eventId={id} />;
}
