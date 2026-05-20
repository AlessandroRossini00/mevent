"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Box, Button, Card, Flex, Text, TextField } from "@radix-ui/themes";
import { initialAuthState } from "@/features/auth/services/types";
import { signup } from "@/features/auth/services/signup-actions";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialAuthState);

  return (
    <Card size="4" className="border border-black/5 shadow-sm">
      <form action={formAction}>
        <Flex direction="column" gap="5">
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
            <Text as="label" size="2" weight="medium">
              Password
            </Text>
            <TextField.Root
              name="password"
              type="password"
              required
              mt="2"
              placeholder="Crea una password"
            />
          </Box>

          {state.error ? (
            <Box className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <Text size="2" color="red">
                {state.error}
              </Text>
            </Box>
          ) : null}

          {state.success ? (
            <Box className="rounded-lg border border-green-200 bg-green-50 px-3 py-2">
              <Text size="2" color="green">
                {state.success}
              </Text>
            </Box>
          ) : null}

          <Button type="submit" size="3" loading={pending}>
            Crea account
          </Button>

          <Flex justify="center" align="center" gap="2" wrap="wrap">
            <Text size="2" color="gray">
              Hai già un account?
            </Text>

            <Link href="/login">
              <Text size="2" weight="medium">
                Accedi
              </Text>
            </Link>
          </Flex>
        </Flex>
      </form>
    </Card>
  );
}
