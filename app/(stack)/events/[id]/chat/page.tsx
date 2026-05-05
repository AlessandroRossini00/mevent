import Link from "next/link";
import { Box, Button, Flex } from "@radix-ui/themes";
import EventChatPanel from "@/features/chat/components/event-chat-panel";
import { markEventChatAsRead } from "@/features/chat/services/chat-actions";

type EventChatPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventChatPage({ params }: EventChatPageProps) {
  const { id } = await params;

  await markEventChatAsRead(id);

  return (
    <Box p="4">
      <Box className="mx-auto w-full max-w-[960px]">
        <Flex direction="column" gap="4">
          <Flex gap="2" wrap="wrap">
            <Link href="/events">
              <Button variant="soft">Torna a Events</Button>
            </Link>

            <Link href={`/events/${id}`}>
              <Button variant="soft">Apri evento</Button>
            </Link>
          </Flex>

          <EventChatPanel eventId={id} />
        </Flex>
      </Box>
    </Box>
  );
}
