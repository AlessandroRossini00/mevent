"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import {
  Avatar,
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    profile.avatar_url ?? null,
  );

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

          <Flex direction="column" gap="3" align="start">
            <Text size="2" weight="medium">
              Foto profilo
            </Text>

            {previewUrl ? (
              <div className="relative h-24 w-24 overflow-hidden rounded-full">
                <Image
                  src={previewUrl}
                  alt={profile.full_name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            ) : (
              <Avatar
                fallback={profile.full_name.slice(0, 2).toUpperCase()}
                size="6"
                radius="full"
              />
            )}

            <input
              name="avatar"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;

                const objectUrl = URL.createObjectURL(file);
                setPreviewUrl(objectUrl);
              }}
            />
          </Flex>

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
