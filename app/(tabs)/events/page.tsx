import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import JoinedEventsList from "@/features/events/components/joined-events-list";

export default function EventsPage() {
  return (
    <Box p="4">
      <Flex direction="column" gap="4">
        <div>
          <Heading size="6">I miei eventi</Heading>
          <Text color="gray">Qui trovi gli eventi a cui partecipi.</Text>
        </div>

        <JoinedEventsList />
      </Flex>
    </Box>
  );
}
