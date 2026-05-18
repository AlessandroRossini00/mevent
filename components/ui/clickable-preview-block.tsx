"use client";

import { Box, Button, Dialog, Flex, Text } from "@radix-ui/themes";

type ClickablePreviewBlockProps = {
  label: string;
  preview: string;
  hint?: string;
  dialogTitle: string;
  dialogContent: React.ReactNode;
};

export default function ClickablePreviewBlock({
  label,
  preview,
  hint,
  dialogTitle,
  dialogContent,
}: ClickablePreviewBlockProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <button type="button" className="w-full text-left">
          <Box className="rounded-xl border border-black/8 bg-black/[0.02] p-3 transition hover:bg-black/[0.04]">
            <Flex direction="column" gap="1">
              <Text size="1" weight="medium" color="gray">
                {label}
              </Text>

              <Text color="gray" className="truncate">
                {preview}
              </Text>

              {hint ? (
                <Text size="1" color="blue">
                  {hint}
                </Text>
              ) : null}
            </Flex>
          </Box>
        </button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="560px">
        <Dialog.Title>{dialogTitle}</Dialog.Title>

        <Box mt="4">{dialogContent}</Box>

        <Flex justify="end" mt="4">
          <Dialog.Close>
            <Button variant="soft">Chiudi</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
