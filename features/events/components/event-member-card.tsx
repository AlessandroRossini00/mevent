"use client";

import { Avatar, Card, Flex, Text } from "@radix-ui/themes";
import type { EventMember } from "@/features/events/services/types";

type EventMemberCardProps = {
  member: EventMember;
  onClick: () => void;
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

export default function EventMemberCard({
  member,
  onClick,
}: EventMemberCardProps) {
  const profile = member.profile;
  const fallback =
    profile?.full_name?.slice(0, 1).toUpperCase() ??
    profile?.username?.slice(0, 1).toUpperCase() ??
    "U";

  const age = getAgeFromBirthDate(profile?.birth_date ?? null);

  return (
    <Card
      size="2"
      className="min-w-[170px] cursor-pointer transition hover:bg-zinc-50"
      onClick={onClick}
    >
      <Flex direction="column" align="center" gap="2">
        <Avatar
          size="5"
          radius="full"
          src={profile?.avatar_url ?? undefined}
          fallback={fallback}
        />

        <Text weight="medium" align="center">
          {profile?.full_name ?? "Utente"}
        </Text>

        <Text size="2" color="gray">
          {age ? `${age} anni` : "Eta non disponibile"}
        </Text>
      </Flex>
    </Card>
  );
}
