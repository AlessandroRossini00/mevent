"use client";

import { Box, Flex, Text } from "@radix-ui/themes";

type DetailBlockProps = {
  label: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function DetailBlock({
  label,
  meta,
  children,
  className,
}: DetailBlockProps) {
  return (
    <Box
      className={`rounded-xl border border-black/8 bg-black/[0.02] p-4 ${className ?? ""}`}
    >
      <Flex direction="column" gap="2">
        <Flex justify="between" align="center" gap="3">
          <Text size="1" weight="medium" color="gray">
            {label}
          </Text>

          {meta ? (
            <Text size="1" color="gray">
              {meta}
            </Text>
          ) : null}
        </Flex>

        {children}
      </Flex>
    </Box>
  );
}
