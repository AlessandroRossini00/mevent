"use client";

import { Avatar, Card, Flex, Heading, Text } from "@radix-ui/themes";
import type { Profile } from "@/features/profile/services/types";

type ProfileHeaderProps = {
  profile: Profile;
};

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const fallback =
    profile.full_name?.slice(0, 1).toUpperCase() ??
    profile.username?.slice(0, 1).toUpperCase() ??
    "U";

  return (
    <Card size="4">
      <Flex align="center" gap="4">
        <Avatar
          size="6"
          radius="full"
          src={profile.avatar_url ?? undefined}
          fallback={fallback}
        />

        <Flex direction="column" gap="1">
          <Heading size="5">{profile.full_name}</Heading>

          {profile.username ? (
            <Text color="gray">@{profile.username}</Text>
          ) : null}

          {profile.city ? <Text color="gray">{profile.city}</Text> : null}
        </Flex>
      </Flex>
    </Card>
  );
}
