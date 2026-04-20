"use client";

import { Card, Flex, Select, TextField } from "@radix-ui/themes";
import { useExploreStore } from "@/features/explore/store/explore";

export default function ExploreFilters() {
  const search = useExploreStore((state) => state.search);
  const category = useExploreStore((state) => state.category);
  const setSearch = useExploreStore((state) => state.setSearch);
  const setCategory = useExploreStore((state) => state.setCategory);

  return (
    <Card size="3">
      <Flex direction={{ initial: "column", md: "row" }} gap="3">
        <div className="flex-1">
          <TextField.Root
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cerca eventi"
          />
        </div>

        <div className="min-w-[220px]">
          <Select.Root value={category} onValueChange={setCategory}>
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="all">Tutte le categorie</Select.Item>
              <Select.Item value="music">Music</Select.Item>
              <Select.Item value="sport">Sport</Select.Item>
              <Select.Item value="food">Food</Select.Item>
              <Select.Item value="networking">Networking</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
      </Flex>
    </Card>
  );
}
