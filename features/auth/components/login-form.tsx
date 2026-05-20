"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import { initialAuthState } from "@/features/auth/services/types";
import { login, loginWithGoogle } from "@/features/auth/services/login-actions";

export default function LoginForm() {
  const [state, loginAction, pending] = useActionState(login, initialAuthState);

  return (
    <Card size="4" className="border border-black/5 shadow-sm">
      <Flex direction="column" gap="5">
        <form action={loginAction}>
          <Flex direction="column" gap="4">
            <Box>
              <Text as="label" size="2" weight="medium">
                Email
              </Text>
              <TextField.Root
                name="email"
                type="email"
                required
                mt="2"
                placeholder="nome@email.com"
              />
            </Box>

            <Box>
              <Flex justify="between" align="center">
                <Text as="label" size="2" weight="medium">
                  Password
                </Text>
              </Flex>

              <TextField.Root
                name="password"
                type="password"
                required
                mt="2"
                placeholder="Inserisci la password"
              />
            </Box>

            {state.error ? (
              <Box className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <Text size="2" color="red">
                  {state.error}
                </Text>
              </Box>
            ) : null}

            <Button type="submit" size="3" loading={pending}>
              Login
            </Button>
          </Flex>
        </form>

        <Flex justify="center" align="center" gap="2" wrap="wrap">
          <Text size="2" color="gray">
            Non hai un account?
          </Text>

          <Link href="/signup">
            <Text size="2" weight="medium">
              Registrati
            </Text>
          </Link>
        </Flex>

        <Flex align="center" gap="3">
          <Separator size="4" className="flex-1" />
          <Text size="1" color="gray">
            oppure
          </Text>
          <Separator size="4" className="flex-1" />
        </Flex>

        <Flex justify="center" align="center" gap="4" direction="column">
          <form action={loginWithGoogle}>
            <Button type="submit" size="3" variant="soft" className="w-full">
              Continua con Google
            </Button>
          </form>
        </Flex>
      </Flex>
    </Card>
  );
}
