"use client";

import Link from "next/link";
import { Card, Flex, Heading, Text } from "@radix-ui/themes";

export default function CreateEventEntry() {
  return (
    <Link href="/events/new" className="block h-full">
      <Card
        size="3"
        className="h-full cursor-pointer transition-colors hover:bg-zinc-50"
      >
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="3"
          className="h-full min-h-105 text-center"
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
