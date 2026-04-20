"use client";

import Link from "next/link";
import { Card, Flex, Heading, Text } from "@radix-ui/themes";

export default function ProfileCreateEventEntry() {
  return (
    <Link href="/events/new" className="block">
      <Card size="3" className="cursor-pointer transition hover:bg-zinc-50">
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="3"
          className="min-h-[280px] text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-3xl text-white">
            +
          </div>

          <div>
            <Heading size="4">Crea evento</Heading>
            <Text color="gray">Apri il form e crea un nuovo evento.</Text>
          </div>
        </Flex>
      </Card>
    </Link>
  );
}
