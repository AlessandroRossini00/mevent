type EventDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;

  return <main className="mx-auto w-full max-w-6xl px-4 py-6"></main>;
}
