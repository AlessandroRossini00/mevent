"use client";

import { Grid, Text, Flex, Spinner } from "@radix-ui/themes";
import { useCreatedEvents } from "@/features/profile/hooks/use-created-events";
import CreatedEventCard from "@/features/profile/components/created-event-card";
import CreateEventEntry from "@/features/profile/components/create-event-entry";

export default function CreatedEventsList() {
  const { events, isLoading, error } = useCreatedEvents();

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

  return (
    <Grid columns={{ initial: "1", md: "2", xl: "3" }} gap="4">
      <CreateEventEntry />

      {events.map((event) => (
        <CreatedEventCard key={event.id} event={event} />
      ))}
    </Grid>
  );
}
