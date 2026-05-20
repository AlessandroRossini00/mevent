"use client";

import Link from "next/link";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import ClickablePreviewBlock from "@/components/ui/clickable-preview-block";

type EventLocationBlockProps = {
  fullAddress: string;
  mapsUrl: string | null;
};

export default function EventLocationBlock({
  fullAddress,
  mapsUrl,
}: EventLocationBlockProps) {
  return (
    <Box className="rounded-2xl border border-black/8 bg-black/[0.02] p-4">
      <Flex direction="column" gap="3">
        <ClickablePreviewBlock
          label="Luogo"
          preview={fullAddress}
          hint="Tocca per vedere tutto"
          dialogTitle="Luogo"
          dialogContent={
            <Flex direction="column" gap="2">
              <Text color="gray">{fullAddress}</Text>
            </Flex>
          }
        />

        {mapsUrl ? (
          <Button asChild variant="soft" className="w-full">
            <Link href={mapsUrl} target="_blank" rel="noreferrer">
              Apri su Google Maps
            </Link>
          </Button>
        ) : null}
      </Flex>
    </Box>
  );
}
