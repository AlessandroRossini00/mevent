"use client";

import * as Slider from "@radix-ui/react-slider";
import { Button, Card, Flex, Select, Text, TextField } from "@radix-ui/themes";
import { EVENT_CATEGORIES } from "@/features/events/services/constants";
import { useExploreFiltersStore } from "@/features/explore/store/explore-filters";

const MIN_PRICE_VALUE = 0;
const MAX_PRICE_VALUE = 9999;
const PRICE_STEP = 5;

const MIN_DISTANCE_VALUE = 0;
const MAX_DISTANCE_VALUE = 100;
const DISTANCE_STEP = 1;

function formatDistanceLabel(value: number) {
  return value === MAX_DISTANCE_VALUE ? "100+ km" : `${value} km`;
}

function formatPriceLabel(value: number) {
  return value === MAX_PRICE_VALUE ? "€9999+" : `€${value}`;
}

type RangeSliderProps = {
  min: number;
  max: number;
  step: number;
  value: number[];
  onValueChange: (value: number[]) => void;
};

function RangeSlider({
  min,
  max,
  step,
  value,
  onValueChange,
}: RangeSliderProps) {
  return (
    <div className="w-full">
      <Slider.Root
        className="relative flex h-5 w-full touch-none select-none items-center"
        min={min}
        max={max}
        step={step}
        value={value}
        minStepsBetweenThumbs={1}
        onValueChange={onValueChange}
      >
        <Slider.Track className="relative h-2 grow rounded-full bg-zinc-200">
          <Slider.Range className="absolute h-full rounded-full bg-black" />
        </Slider.Track>

        {value.map((_, index) => (
          <Slider.Thumb
            key={index}
            className="block h-5 w-5 rounded-full border border-black/10 bg-white shadow outline-none"
          />
        ))}
      </Slider.Root>
    </div>
  );
}

export default function ExploreFilters() {
  const category = useExploreFiltersStore((state) => state.category);
  const dateFrom = useExploreFiltersStore((state) => state.dateFrom);
  const dateTo = useExploreFiltersStore((state) => state.dateTo);
  const minPrice = useExploreFiltersStore((state) => state.minPrice);
  const maxPrice = useExploreFiltersStore((state) => state.maxPrice);
  const minDistanceKm = useExploreFiltersStore((state) => state.minDistanceKm);
  const maxDistanceKm = useExploreFiltersStore((state) => state.maxDistanceKm);
  const isLocating = useExploreFiltersStore((state) => state.isLocating);
  const locationError = useExploreFiltersStore((state) => state.locationError);

  const setCategory = useExploreFiltersStore((state) => state.setCategory);
  const setDateFrom = useExploreFiltersStore((state) => state.setDateFrom);
  const setDateTo = useExploreFiltersStore((state) => state.setDateTo);
  const setMinPrice = useExploreFiltersStore((state) => state.setMinPrice);
  const setMaxPrice = useExploreFiltersStore((state) => state.setMaxPrice);
  const setDistanceRange = useExploreFiltersStore(
    (state) => state.setDistanceRange,
  );
  const requestUserLocation = useExploreFiltersStore(
    (state) => state.requestUserLocation,
  );
  const applyFilters = useExploreFiltersStore((state) => state.applyFilters);
  const resetFilters = useExploreFiltersStore((state) => state.resetFilters);

  const minPriceValue = minPrice.trim() ? Number(minPrice) : MIN_PRICE_VALUE;
  const maxPriceValue = maxPrice.trim() ? Number(maxPrice) : MAX_PRICE_VALUE;

  return (
    <Card size="3">
      <Flex direction="column" gap="4">
        <Text size="4" weight="medium">
          Filtri
        </Text>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Select.Root value={category} onValueChange={setCategory}>
            <Select.Trigger placeholder="Categoria" />
            <Select.Content>
              <Select.Item value="all">Tutte le categorie</Select.Item>
              {EVENT_CATEGORIES.map((item) => (
                <Select.Item key={item} value={item}>
                  {item}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Button
            type="button"
            variant="soft"
            onClick={() => void requestUserLocation()}
          >
            Usa la mia posizione
          </Button>
        </div>

        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            Data
          </Text>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Flex align="center" gap="2">
              <Text size="1" color="gray" className="min-w-5">
                Da
              </Text>
              <div className="flex-1">
                <TextField.Root
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                />
              </div>
            </Flex>

            <Flex align="center" gap="2">
              <Text size="1" color="gray" className="min-w-5">
                A
              </Text>
              <div className="flex-1">
                <TextField.Root
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                />
              </div>
            </Flex>
          </div>
        </Flex>

        <Flex direction="column" gap="3">
          <Text size="2" weight="medium">
            Prezzo
          </Text>

          <Flex justify="between" align="center">
            <Text size="2" color="gray">
              {formatPriceLabel(minPriceValue)}
            </Text>
            <Text size="2" color="gray">
              Intervallo selezionato: €{minPriceValue} - €{maxPriceValue}
            </Text>
            <Text size="2" color="gray">
              {formatPriceLabel(maxPriceValue)}
            </Text>
          </Flex>

          <RangeSlider
            min={MIN_PRICE_VALUE}
            max={MAX_PRICE_VALUE}
            step={PRICE_STEP}
            value={[minPriceValue, maxPriceValue]}
            onValueChange={([nextMin, nextMax]) => {
              setMinPrice(String(nextMin));
              setMaxPrice(String(nextMax));
            }}
          />
        </Flex>

        <Flex direction="column" gap="3">
          <Text size="2" weight="medium">
            Distanza
          </Text>

          <Flex justify="between" align="center">
            <Text size="2" color="gray">
              {formatDistanceLabel(minDistanceKm)}
            </Text>
            <Text size="2" color="gray">
              Da {formatDistanceLabel(minDistanceKm)} a{" "}
              {formatDistanceLabel(maxDistanceKm)}
            </Text>
            <Text size="2" color="gray">
              {formatDistanceLabel(maxDistanceKm)}
            </Text>
          </Flex>

          <RangeSlider
            min={MIN_DISTANCE_VALUE}
            max={MAX_DISTANCE_VALUE}
            step={DISTANCE_STEP}
            value={[minDistanceKm, maxDistanceKm]}
            onValueChange={([nextMin, nextMax]) => {
              setDistanceRange([nextMin, nextMax]);
            }}
          />
        </Flex>

        {isLocating ? (
          <Text size="1" color="gray">
            Sto cercando la tua posizione...
          </Text>
        ) : null}

        {locationError ? (
          <Text size="1" color="red">
            {locationError}
          </Text>
        ) : null}

        <Flex justify="end" gap="3">
          <Button variant="soft" color="gray" onClick={resetFilters}>
            Reset filtri
          </Button>

          <Button onClick={applyFilters}>Cerca</Button>
        </Flex>
      </Flex>
    </Card>
  );
}
