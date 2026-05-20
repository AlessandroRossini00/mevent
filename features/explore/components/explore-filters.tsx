"use client";

import * as Slider from "@radix-ui/react-slider";
import { Button, Card, Flex, Switch, Text, TextField } from "@radix-ui/themes";

import { useState } from "react";
import { useExploreFiltersStore } from "@/features/explore/store/explore-filters";

import {
  MIN_PRICE as MIN_PRICE_VALUE,
  MAX_PRICE as MAX_PRICE_VALUE,
  PRICE_STEP,
  MIN_DISTANCE as MIN_DISTANCE_VALUE,
  MAX_DISTANCE as MAX_DISTANCE_VALUE,
  DISTANCE_STEP,
} from "../constants";
import { EVENT_CATEGORIES } from "@/features/events/constants";

function formatDistanceLabel(value: number) {
  return value === MAX_DISTANCE_VALUE ? `${value}+ km` : `${value} km`;
}

function formatPriceLabel(value: number) {
  return value === MAX_PRICE_VALUE ? `€${value}+` : `€${value}`;
}

function formatCategoryLabel(value: string) {
  if (value === "all") return "All";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

type RangeSliderProps = {
  min: number;
  max: number;
  step: number;
  value: number[];
  text: string[];
  onValueChange: (value: number[]) => void;
};

function RangeSlider({
  min,
  max,
  step,
  value,
  onValueChange,
  text,
}: RangeSliderProps) {
  return (
    <div className="w-full px-1.5">
      <Slider.Root
        className="relative flex h-5 w-full touch-none select-none items-center"
        min={min}
        max={max}
        step={step}
        value={value}
        minStepsBetweenThumbs={10}
        onValueChange={onValueChange}
      >
        <Slider.Track className="relative h-2 grow rounded-full bg-zinc-200">
          <Slider.Range className="absolute h-full rounded-full bg-black" />
        </Slider.Track>

        {value.map((_, index) => (
          <Slider.Thumb
            key={index}
            className="block h-5 w-5 rounded-full border border-black/10 bg-white shadow outline-none"
          >
            <Text
              size="1"
              weight="medium"
              color="gray"
              className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              {text[index]}
            </Text>
          </Slider.Thumb>
        ))}
      </Slider.Root>
    </div>
  );
}

export default function ExploreFilters() {
  const [isExpanded, setIsExpanded] = useState(false);

  const category = useExploreFiltersStore((state) => state.category);
  const dateFrom = useExploreFiltersStore((state) => state.dateFrom);
  const dateTo = useExploreFiltersStore((state) => state.dateTo);
  const minPrice = useExploreFiltersStore((state) => state.minPrice);
  const maxPrice = useExploreFiltersStore((state) => state.maxPrice);
  const minDistanceKm = useExploreFiltersStore((state) => state.minDistanceKm);
  const maxDistanceKm = useExploreFiltersStore((state) => state.maxDistanceKm);
  const isLocating = useExploreFiltersStore((state) => state.isLocating);
  const locationError = useExploreFiltersStore((state) => state.locationError);
  const userLatitude = useExploreFiltersStore((state) => state.userLatitude);
  const userLongitude = useExploreFiltersStore((state) => state.userLongitude);

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
  const setUserLocation = useExploreFiltersStore(
    (state) => state.setUserLocation,
  );
  const setLocationError = useExploreFiltersStore(
    (state) => state.setLocationError,
  );
  const applyFilters = useExploreFiltersStore((state) => state.applyFilters);
  const resetFilters = useExploreFiltersStore((state) => state.resetFilters);

  const minPriceValue = minPrice.trim() ? Number(minPrice) : MIN_PRICE_VALUE;
  const maxPriceValue = maxPrice.trim() ? Number(maxPrice) : MAX_PRICE_VALUE;

  const isLocationEnabled = userLatitude !== null && userLongitude !== null;

  return (
    <div className="sticky top-0 z-30">
      <Card size="2" className="border border-black/5 shadow-sm">
        <Flex direction="column" gap="3">
          <Flex align="center" justify="between" gap="3" wrap="wrap">
            <Flex align="center" gap="3">
              <Text size="2" weight="medium">
                Filtri
              </Text>

              <Flex align="center" gap="2">
                <Text size="1" color="gray">
                  Posizione
                </Text>

                <Switch
                  checked={isLocationEnabled}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      void requestUserLocation();
                      return;
                    }

                    setUserLocation(null, null);
                    setLocationError(null);
                  }}
                />
              </Flex>
            </Flex>

            <Flex align="center" gap="2">
              <Button
                variant="soft"
                color="gray"
                onClick={() => setIsExpanded((prev) => !prev)}
              >
                {isExpanded ? "Restringi filtri" : "Espandi filtri"}
              </Button>

              <Button variant="soft" color="gray" onClick={resetFilters}>
                Reset
              </Button>

              <Button onClick={applyFilters}>Cerca</Button>
            </Flex>
          </Flex>

          <div className="overflow-x-auto">
            <Flex gap="2" wrap="nowrap" className="min-w-max">
              {["all", ...EVENT_CATEGORIES].map((item) => {
                const isActive = category === item;

                return (
                  <Button
                    key={item}
                    size="1"
                    variant={isActive ? "solid" : "soft"}
                    color={isActive ? "gray" : "gray"}
                    onClick={() => setCategory(item)}
                    className="shrink-0"
                  >
                    {formatCategoryLabel(item)}
                  </Button>
                );
              })}
            </Flex>
          </div>

          {isExpanded ? (
            <Flex direction="column" gap="4">
              <Flex direction="column" gap="2">
                <Text size="1" weight="medium">
                  Data
                </Text>

                <Flex gap="3" wrap="wrap">
                  <Flex align="center" gap="2" className="min-w-[220px] flex-1">
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

                  <Flex align="center" gap="2" className="min-w-[220px] flex-1">
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
                </Flex>
              </Flex>

              <Flex gap="4" wrap="wrap">
                <Flex
                  direction="column"
                  gap="3"
                  className="min-w-[260px] flex-1 "
                >
                  <Text size="1" weight="medium" mb="4">
                    Prezzo
                  </Text>

                  <RangeSlider
                    min={MIN_PRICE_VALUE}
                    max={MAX_PRICE_VALUE}
                    step={PRICE_STEP}
                    value={[minPriceValue, maxPriceValue]}
                    text={[
                      formatPriceLabel(minPriceValue),
                      formatPriceLabel(maxPriceValue),
                    ]}
                    onValueChange={([nextMin, nextMax]) => {
                      setMinPrice(String(nextMin));
                      setMaxPrice(String(nextMax));
                    }}
                  />
                </Flex>

                {isLocationEnabled ? (
                  <Flex
                    direction="column"
                    gap="3"
                    className="min-w-[260px] flex-1"
                  >
                    <Text size="1" weight="medium" mb="4">
                      Distanza
                    </Text>

                    <RangeSlider
                      min={MIN_DISTANCE_VALUE}
                      max={MAX_DISTANCE_VALUE}
                      step={DISTANCE_STEP}
                      value={[minDistanceKm, maxDistanceKm]}
                      text={[
                        formatDistanceLabel(minDistanceKm),
                        formatDistanceLabel(maxDistanceKm),
                      ]}
                      onValueChange={([nextMin, nextMax]) => {
                        setDistanceRange([nextMin, nextMax]);
                      }}
                    />
                  </Flex>
                ) : null}
              </Flex>
            </Flex>
          ) : null}

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
        </Flex>
      </Card>
    </div>
  );
}
