"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Avatar, Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import type { EventMember } from "@/features/events/services/types";

type EventMemberDialogProps = {
  member: EventMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function getAgeFromBirthDate(birthDate: string | null) {
  if (!birthDate) return null;

  const today = new Date();
  const birth = new Date(birthDate);

  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());

  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

export default function EventMemberDialog({
  member,
  open,
  onOpenChange,
}: EventMemberDialogProps) {
  const profile = member?.profile;
  const fallback =
    profile?.full_name?.slice(0, 1).toUpperCase() ??
    profile?.username?.slice(0, 1).toUpperCase() ??
    "U";

  const age = getAgeFromBirthDate(profile?.birth_date ?? null);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 outline-none">
          <Card size="4">
            <Flex direction="column" gap="4">
              <Flex align="center" gap="3">
                <Avatar
                  size="6"
                  radius="full"
                  src={profile?.avatar_url ?? undefined}
                  fallback={fallback}
                />

                <Flex direction="column" gap="1">
                  <Heading size="5">{profile?.full_name ?? "Utente"}</Heading>

                  {profile?.username ? (
                    <Text color="gray">@{profile.username}</Text>
                  ) : null}
                </Flex>
              </Flex>

              <Flex direction="column" gap="2">
                <Text>
                  <strong>Eta:</strong>{" "}
                  {age ? `${age} anni` : "Non disponibile"}
                </Text>
                <Text>
                  <strong>Citta:</strong> {profile?.city ?? "Non disponibile"}
                </Text>
                <Text>
                  <strong>Ruolo evento:</strong> {member?.role ?? "member"}
                </Text>
                <Text>
                  <strong>Bio:</strong> {profile?.bio ?? "Nessuna bio"}
                </Text>
              </Flex>

              <Flex justify="end">
                <Dialog.Close asChild>
                  <Button variant="soft">Chiudi</Button>
                </Dialog.Close>
              </Flex>
            </Flex>
          </Card>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
