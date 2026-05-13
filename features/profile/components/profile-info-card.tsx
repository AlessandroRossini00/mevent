"use client";

import { Box, Button, Card, Flex, Separator, Text } from "@radix-ui/themes";
import type { Profile } from "@/features/profile/services/types";
import InfoBlock from "@/components/ui/info-block";
import ImagePreviewDialog from "@/components/ui/image-preview-dialog";

type ProfileInfoCardProps = {
  profile: Profile;
  onEdit: () => void;
};

function formatBirthDate(value: string | null) {
  if (!value) return "Non impostata";

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

export default function ProfileInfoCard({
  profile,
  onEdit,
}: ProfileInfoCardProps) {
  const fallback =
    profile.full_name?.slice(0, 2).toUpperCase() ??
    profile.username?.slice(0, 2).toUpperCase() ??
    "US";

  return (
    <Card size="4">
      <Flex direction="column" gap="5" align="center">
        <ImagePreviewDialog
          variant="profile"
          src={profile.avatar_url}
          alt={profile.full_name}
          fallback={fallback}
          size={120}
          dialogTitle="Anteprima foto profilo"
        />

        <Separator size="4" />

        <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
          <InfoBlock label="Nome completo" value={profile.full_name} />
          <InfoBlock
            label="Username"
            value={profile.username ? `@${profile.username}` : "Non impostato"}
          />
          <InfoBlock
            label="Data di nascita"
            value={formatBirthDate(profile.birth_date)}
          />
          <InfoBlock label="Città" value={profile.city ?? "Non impostata"} />
        </div>

        <Box className="w-full rounded-xl border border-black/8 bg-black/2 p-4">
          <Flex direction="column" gap="1">
            <Text size="1" weight="medium" color="gray">
              Bio
            </Text>
            <Text size="3">{profile.bio ?? "Nessuna bio inserita"}</Text>
          </Flex>
        </Box>

        <Button className="w-full" onClick={onEdit}>
          Modifica
        </Button>
      </Flex>
    </Card>
  );
}
