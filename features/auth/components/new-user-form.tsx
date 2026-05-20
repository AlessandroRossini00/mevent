"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { createNewUserProfile } from "@/features/auth/services/new-user-actions";
import { optimizeImage } from "@/lib/utils";

type NewUserFormProps = {
  message?: string;
};

export default function NewUserForm({ message }: NewUserFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setLocalError(null);

    try {
      const avatar = formData.get("avatar") as File | null;
      const nextFormData = new FormData();
      for (const [key, value] of formData.entries()) {
        nextFormData.append(key, value);
      }

      if (avatar && avatar.size > 0) {
        const optimizedAvatar = await optimizeImage(avatar);
        nextFormData.set("avatar", optimizedAvatar, optimizedAvatar.name);
      }

      await createNewUserProfile(nextFormData);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Errore creazione profilo",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card size="4" className="border border-black/5 shadow-sm">
      <form action={handleSubmit}>
        <Flex direction="column" gap="5">
          <Flex direction="column" gap="1">
            <Text size="6" weight="bold">
              Completa il tuo profilo
            </Text>
            <Text size="2" color="gray">
              Ti basta un ultimo passaggio per iniziare a usare l’app.
            </Text>
          </Flex>

          <Box>
            <Text as="label" size="2" weight="medium">
              Username
            </Text>
            <TextField.Root
              name="username"
              required
              mt="2"
              placeholder="mario.rossi"
            />
          </Box>

          <Box>
            <Text as="label" size="2" weight="medium">
              Nome completo
            </Text>
            <TextField.Root
              name="fullName"
              required
              mt="2"
              placeholder="Mario Rossi"
            />
          </Box>

          <Box>
            <Text as="label" size="2" weight="medium">
              Data di nascita
            </Text>
            <TextField.Root name="birthDate" type="date" required mt="2" />
          </Box>

          <Box>
            <Text as="label" size="2" weight="medium">
              Città
            </Text>
            <TextField.Root name="city" required mt="2" placeholder="Milano" />
          </Box>

          <Box>
            <Text as="label" size="2" weight="medium">
              Bio
            </Text>
            <TextArea
              name="bio"
              mt="2"
              rows={4}
              placeholder="Scrivi qualcosa su di te"
            />
          </Box>

          <Box>
            <Text as="label" size="2" weight="medium">
              Foto profilo
            </Text>
            <Box
              mt="2"
              className="rounded-xl border border-dashed border-black/15 bg-black/[0.02] px-4 py-4"
            >
              <input
                name="avatar"
                type="file"
                accept="image/*"
                required
                className="w-full text-sm"
              />
              <Text size="1" color="gray" mt="2">
                L’immagine verrà ottimizzata prima del caricamento.
              </Text>
            </Box>
          </Box>

          {message ? (
            <Box className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <Text size="2" color="red">
                {message}
              </Text>
            </Box>
          ) : null}

          {localError ? (
            <Box className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <Text size="2" color="red">
                {localError}
              </Text>
            </Box>
          ) : null}

          <Button size="3" type="submit" loading={isPending}>
            Conferma
          </Button>
        </Flex>
      </form>
    </Card>
  );
}
