"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Flex,
  IconButton,
  Text,
  TextField,
} from "@radix-ui/themes";

const LocationPickerMap = dynamic(
  () => import("@/features/events/components/event-form/location-picker-map"),
  { ssr: false },
);

type SearchHit = {
  place_id: number;
  display_name: string;
  lat: number | string;
  lon: number | string;
  name: string | null;
  address: string | null;
};

type ReverseResult = {
  location_name: string | null;
  address: string | null;
  latitude: number | string;
  longitude: number | string;
  maps_url: string;
};

type LocationPickerFieldProps = {
  defaultValues?: {
    location_name?: string | null;
    address?: string | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
    maps_url?: string | null;
  };
};

type SelectedLocation = {
  location_name: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  maps_url: string;
};

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function LocationPickerField({
  defaultValues,
}: LocationPickerFieldProps) {
  const defaultLatitude = toNumber(defaultValues?.latitude);
  const defaultLongitude = toNumber(defaultValues?.longitude);

  const initialLat = defaultLatitude ?? 43.7696;
  const initialLon = defaultLongitude ?? 11.2558;

  const [query, setQuery] = useState(defaultValues?.location_name ?? "");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selected, setSelected] = useState<SelectedLocation | null>(
    defaultLatitude !== null && defaultLongitude !== null
      ? {
          location_name: defaultValues?.location_name ?? null,
          address: defaultValues?.address ?? null,
          latitude: defaultLatitude,
          longitude: defaultLongitude,
          maps_url:
            defaultValues?.maps_url ??
            `https://www.google.com/maps?q=${defaultLatitude},${defaultLongitude}`,
        }
      : null,
  );

  const mapLat = selected?.latitude ?? initialLat;
  const mapLon = selected?.longitude ?? initialLon;

  async function runSearch() {
    if (query.trim().length < 3) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/osm/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } finally {
      setIsSearching(false);
    }
  }

  async function reversePick(lat: number, lon: number) {
    const res = await fetch(`/api/osm/reverse?lat=${lat}&lon=${lon}`);
    const data = (await res.json()) as ReverseResult;

    const parsedLat = toNumber(data.latitude);
    const parsedLon = toNumber(data.longitude);

    if (parsedLat === null || parsedLon === null) {
      return;
    }

    const nextSelected: SelectedLocation = {
      location_name: data.location_name ?? null,
      address: data.address ?? null,
      latitude: parsedLat,
      longitude: parsedLon,
      maps_url:
        data.maps_url ||
        `https://www.google.com/maps?q=${parsedLat},${parsedLon}`,
    };

    setSelected(nextSelected);
    setResults([]);

    if (nextSelected.location_name) {
      setQuery(nextSelected.location_name);
    }
  }

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        <Text size="2" weight="medium">
          Luogo evento
        </Text>

        <input
          type="hidden"
          name="location_name"
          value={selected?.location_name ?? ""}
        />
        <input type="hidden" name="address" value={selected?.address ?? ""} />
        <input type="hidden" name="latitude" value={selected?.latitude ?? ""} />
        <input
          type="hidden"
          name="longitude"
          value={selected?.longitude ?? ""}
        />
        <input type="hidden" name="maps_url" value={selected?.maps_url ?? ""} />

        <Flex gap="2">
          <TextField.Root
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cerca un luogo"
            className="flex-1"
          />
          <IconButton
            type="button"
            onClick={() => void runSearch()}
            disabled={isSearching || query.trim().length < 3}
          >
            <MagnifyingGlassIcon />
          </IconButton>
        </Flex>

        {results.length > 0 ? (
          <Box className="rounded-xl border border-black/8 bg-white">
            <Flex direction="column">
              {results.map((result) => (
                <button
                  key={result.place_id}
                  type="button"
                  onClick={() => {
                    const lat = toNumber(result.lat);
                    const lon = toNumber(result.lon);
                    if (lat === null || lon === null) return;
                    void reversePick(lat, lon);
                  }}
                  className="border-b border-black/6 px-4 py-3 text-left last:border-b-0"
                >
                  <Text as="div" weight="medium">
                    {result.name ?? result.display_name}
                  </Text>
                  <Text as="div" size="1" color="gray">
                    {result.address ?? result.display_name}
                  </Text>
                </button>
              ))}
            </Flex>
          </Box>
        ) : null}

        <Box className="overflow-hidden rounded-xl border border-black/8">
          <LocationPickerMap
            latitude={mapLat}
            longitude={mapLon}
            selected={
              selected
                ? {
                    latitude: selected.latitude,
                    longitude: selected.longitude,
                  }
                : null
            }
            onPick={(lat, lon) => void reversePick(lat, lon)}
          />
        </Box>

        {selected ? (
          <Box className="rounded-xl border border-black/8 bg-black/[0.02] p-4">
            <Flex direction="column" gap="2">
              <Text size="1" weight="medium" color="gray">
                Luogo selezionato
              </Text>

              <Text>{selected.location_name ?? "Luogo selezionato"}</Text>

              <Text size="2" color="gray">
                {selected.address}
              </Text>

              {selected.maps_url ? (
                <Button asChild variant="soft">
                  <a href={selected.maps_url} target="_blank" rel="noreferrer">
                    Apri su Google Maps
                  </a>
                </Button>
              ) : null}
            </Flex>
          </Box>
        ) : null}
      </Flex>
    </Card>
  );
}
