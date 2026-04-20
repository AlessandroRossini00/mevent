"use client";

import { Card, Flex, Text } from "@radix-ui/themes";
import type { Profile } from "@/features/profile/services/types";

type ProfileInfoCardProps = {
  profile: Profile;
};

export default function ProfileInfoCard({ profile }: ProfileInfoCardProps) {
  return (
    <Card size="3">
      <Flex direction="column" gap="3">
        <Text size="3" weight="medium">
          Informazioni
        </Text>

        <Flex direction="column" gap="2">
          <Text>
            <strong>Nome:</strong> {profile.full_name}
          </Text>
          <Text>
            <strong>Username:</strong> {profile.username ?? "Non impostato"}
          </Text>
          <Text>
            <strong>Data di nascita:</strong>{" "}
            {profile.birth_date ?? "Non impostata"}
          </Text>
          <Text>
            <strong>Città:</strong> {profile.city ?? "Non impostata"}
          </Text>
          <Text>
            <strong>Bio:</strong> {profile.bio ?? "Nessuna bio"}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}
