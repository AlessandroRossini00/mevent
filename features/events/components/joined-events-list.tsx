"use client";

import { Flex, Grid, Spinner, Text } from "@radix-ui/themes";
import JoinedEventCard from "@/features/events/components/joined-event-card";
import { useJoinedEvents } from "@/features/events/hooks/use-joined-events";

export default function JoinedEventsList() {
  const { events, isLoading, error } = useJoinedEvents();

  if (isLoading) {
    return (
      <Flex justify="center" py="8">
        <Spinner size="3" />
      </Flex>
    );
  }

  if (error) {
    return <Text color="red">{error}</Text>;
  }

  if (!events.length) {
    return <Text color="gray">Non partecipi ancora a eventi.</Text>;
  }

  return (
    <Grid columns={{ initial: "1", md: "2", xl: "3" }} gap="4">
      {events.map((event) => (
        <JoinedEventCard key={event.id} event={event} />
      ))}
    </Grid>
  );
}
