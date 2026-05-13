"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { useProfileActions } from "@/features/profile/hooks/use-profile-actions";
import { PROFILE_LIMITS } from "@/features/profile/services/constants";
import type { Profile } from "@/features/profile/services/types";
import FieldBlock from "@/components/ui/field-block";
import ImagePicker from "@/components/ui/image-picker";

type EditProfileFormProps = {
  profile: Profile;
  onCancel: () => void;
  onSuccess: () => void;
};

export default function EditProfileForm({
  profile,
  onCancel,
  onSuccess,
}: EditProfileFormProps) {
  const { updateProfile, actionError } = useProfileActions();
  const [isPending, startTransition] = useTransition();
  const [localError, setLocalError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    profile.avatar_url ?? null,
  );

  const [usernameValue, setUsernameValue] = useState(profile.username ?? "");
  const [fullNameValue, setFullNameValue] = useState(profile.full_name ?? "");
  const [cityValue, setCityValue] = useState(profile.city ?? "");
  const [bioValue, setBioValue] = useState(profile.bio ?? "");

  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleSubmit = (formData: FormData) => {
    setLocalError(null);

    startTransition(async () => {
      try {
        await updateProfile(formData);
        onSuccess();
      } catch (err) {
        setLocalError(
          err instanceof Error ? err.message : "Errore aggiornamento profilo",
        );
      }
    });
  };

  const fallback =
    profile.full_name?.slice(0, 2).toUpperCase() ??
    profile.username?.slice(0, 2).toUpperCase() ??
    "US";

  return (
    <Card size="4">
      <form action={handleSubmit}>
        <Flex direction="column" gap="5" align="center">
          <ImagePicker
            variant="profile"
            src={previewUrl}
            alt={profile.full_name}
            fallback={fallback}
            size={120}
            inputName="avatar"
            dialogTitle="Anteprima foto profilo"
            helperText="Tocca la foto per l'anteprima o la matita per cambiarla"
            onFileChange={(file) => {
              setPreviewUrl(URL.createObjectURL(file));
            }}
          />

          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
            <FieldBlock
              label="Username"
              counter={`${usernameValue.length}/${PROFILE_LIMITS.username}`}
            >
              <TextField.Root
                name="username"
                value={usernameValue}
                placeholder="username"
                maxLength={PROFILE_LIMITS.username}
                required
                onChange={(event) => setUsernameValue(event.target.value)}
              />
            </FieldBlock>

            <FieldBlock
              label="Nome completo"
              counter={`${fullNameValue.length}/${PROFILE_LIMITS.fullName}`}
            >
              <TextField.Root
                name="full_name"
                value={fullNameValue}
                placeholder="Mario Rossi"
                maxLength={PROFILE_LIMITS.fullName}
                required
                onChange={(event) => setFullNameValue(event.target.value)}
              />
            </FieldBlock>

            <FieldBlock label="Data di nascita">
              <TextField.Root
                name="birth_date"
                type="date"
                defaultValue={profile.birth_date ?? ""}
                required
              />
            </FieldBlock>

            <FieldBlock
              label="Città"
              counter={`${cityValue.length}/${PROFILE_LIMITS.city}`}
            >
              <TextField.Root
                name="city"
                value={cityValue}
                placeholder="Milano"
                maxLength={PROFILE_LIMITS.city}
                required
                onChange={(event) => setCityValue(event.target.value)}
              />
            </FieldBlock>
          </div>

          <Box className="w-full rounded-xl border border-black/8 bg-black/2 p-4">
            <Flex direction="column" gap="2">
              <Flex justify="between" align="center" gap="3">
                <Text size="1" weight="medium" color="gray">
                  Bio
                </Text>
                <Text size="1" color="gray">
                  {bioValue.length}/{PROFILE_LIMITS.bio}
                </Text>
              </Flex>

              <TextArea
                name="bio"
                value={bioValue}
                placeholder="Racconta qualcosa su di te"
                maxLength={PROFILE_LIMITS.bio}
                onChange={(event) => setBioValue(event.target.value)}
              />
            </Flex>
          </Box>

          {localError || actionError ? (
            <Text color="red">{localError ?? actionError}</Text>
          ) : null}

          <Flex className="w-full" gap="3" justify="end">
            <Button
              type="button"
              variant="soft"
              color="gray"
              onClick={onCancel}
            >
              Annulla
            </Button>

            <Button type="submit" loading={isPending}>
              Salva modifiche
            </Button>
          </Flex>
        </Flex>
      </form>
    </Card>
  );
}
