"use client";

import { useState, useTransition } from "react";
import {
  Button,
  Card,
  Flex,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { useProfileActions } from "@/features/profile/hooks/use-profile-actions";
import type { Profile } from "@/features/profile/services/types";

type EditProfileFormProps = {
  profile: Profile;
};

export default function EditProfileForm({ profile }: EditProfileFormProps) {
  const { updateProfile, actionError } = useProfileActions();
  const [isPending, startTransition] = useTransition();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setLocalError(null);

    startTransition(async () => {
      try {
        await updateProfile(formData);
      } catch (err) {
        setLocalError(
          err instanceof Error ? err.message : "Errore aggiornamento profilo",
        );
      }
    });
  };

  return (
    <Card size="3">
      <form action={handleSubmit}>
        <Flex direction="column" gap="4">
          <Text size="3" weight="medium">
            Modifica profilo
          </Text>

          <div>
            <Text as="label" size="2" weight="medium">
              Username
            </Text>
            <TextField.Root
              name="username"
              defaultValue={profile.username ?? ""}
            />
          </div>

          <div>
            <Text as="label" size="2" weight="medium">
              Nome completo
            </Text>
            <TextField.Root
              name="full_name"
              defaultValue={profile.full_name}
              required
            />
          </div>

          <div>
            <Text as="label" size="2" weight="medium">
              Data di nascita
            </Text>
            <TextField.Root
              name="birth_date"
              type="date"
              defaultValue={profile.birth_date ?? ""}
            />
          </div>

          <div>
            <Text as="label" size="2" weight="medium">
              Città
            </Text>
            <TextField.Root name="city" defaultValue={profile.city ?? ""} />
          </div>

          <div>
            <Text as="label" size="2" weight="medium">
              Bio
            </Text>
            <TextArea name="bio" defaultValue={profile.bio ?? ""} />
          </div>

          {localError || actionError ? (
            <Text color="red">{localError ?? actionError}</Text>
          ) : null}

          <Button type="submit" loading={isPending}>
            Salva modifiche
          </Button>
        </Flex>
      </form>
    </Card>
  );
}
