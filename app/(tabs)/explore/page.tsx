// app/(tabs)/home/page.tsx
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Flex,
  TextField,
  Select,
  Button,
  Separator,
  Box,
  Badge,
} from "@radix-ui/themes";

export default function HomePage() {
  return (
    <Flex
      gap={"3"}
      direction={"column"}
      justify={"center"}
      align={"center"}
      className="bg-amber-400"
    >
      <SearchFiltersBar />
      <Box width="64px" height="64px" className="bg-red-600">
        <h1>Home</h1>
      </Box>
      <h1>Home</h1>
      <Link href="/explore/filters">Vai a Details (push nello stack Home)</Link>
      <Button size="4">BUTTON</Button>
      <Badge className={"p-0"}>Ciao</Badge>
    </Flex>
  );
}

function FilterBar() {
  return <div></div>;
}

export function SearchFiltersBar() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("recent");
  useEffect(() => {
    console.log(query);
    return;
  }, [query]);
  return (
    <Flex
      direction={{ initial: "column", sm: "row" }}
      gap="3"
      align={{ sm: "end" }}
      className="w-full rounded-xl border border-zinc-200 bg-white p-3"
    >
      <TextField.Root
        placeholder="Cerca eventi, utenti, luoghi..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full sm:max-w-md"
      />

      <Select.Root value={category} onValueChange={setCategory}>
        <Select.Trigger placeholder="Categoria" />
        <Select.Content>
          <Select.Item value="all">Tutte</Select.Item>
          <Select.Item value="music">Musica</Select.Item>
          <Select.Item value="sports">Sport</Select.Item>
          <Select.Item value="tech">Tech</Select.Item>
        </Select.Content>
      </Select.Root>

      <Select.Root value={sort} onValueChange={setSort}>
        <Select.Trigger placeholder="Ordina per" />
        <Select.Content>
          <Select.Item value="recent">Più recenti</Select.Item>
          <Select.Item value="popular">Più popolari</Select.Item>
          <Select.Item value="price_low">Prezzo crescente</Select.Item>
        </Select.Content>
      </Select.Root>

      <Separator orientation="vertical" className="hidden h-8 sm:block" />

      <Flex gap="2" className="sm:ml-auto">
        <Button variant="soft" color="gray">
          Reset
        </Button>
        <Button>Cerca</Button>
      </Flex>
    </Flex>
  );
}
