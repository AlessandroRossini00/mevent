import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import CreateEventForm from "@/features/events/components/create-event-form";

export default function NewEventPage() {
  return (
    <Box p="4">
      <Flex direction="column" gap="4" maxWidth="800px">
        <div>
          <Heading size="6">Crea evento</Heading>
          <Text color="gray">
            Inserisci i dettagli principali del tuo evento.
          </Text>
        </div>

        <CreateEventForm />
      </Flex>
    </Box>
  );
}
