"use client";

import { useState } from "react";
import { Flex, Heading, ScrollArea, Text } from "@radix-ui/themes";
import EventMemberCard from "@/features/events/components/event-member-card";
import EventMemberDialog from "@/features/events/components/event-member-dialog";
import type {
  EventMember,
  EventWithRelations,
} from "@/features/events/services/types";

type EventMembersCarouselProps = {
  event: EventWithRelations;
};

export default function EventMembersCarousel({
  event,
}: EventMembersCarouselProps) {
  const members = event.event_members ?? [];
  const [selectedMember, setSelectedMember] = useState<EventMember | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenMember = (member: EventMember) => {
    setSelectedMember(member);
    setIsOpen(true);
  };

  return (
    <>
      <Flex direction="column" gap="3">
        <div>
          <Heading size="4">Partecipanti</Heading>
          <Text color="gray">
            Tocca un profilo per vedere più informazioni.
          </Text>
        </div>

        {!members.length ? (
          <Text color="gray">Nessun partecipante disponibile.</Text>
        ) : (
          <ScrollArea type="auto" scrollbars="horizontal">
            <Flex gap="3" pr="3">
              {members.map((member) => (
                <EventMemberCard
                  key={member.user_id}
                  member={member}
                  onClick={() => handleOpenMember(member)}
                />
              ))}
            </Flex>
          </ScrollArea>
        )}
      </Flex>

      <EventMemberDialog
        member={selectedMember}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}
