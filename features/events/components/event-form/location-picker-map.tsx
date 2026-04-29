"use client";

import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

type SelectedLocation = {
  latitude: number;
  longitude: number;
};

type LocationPickerMapProps = {
  latitude: number;
  longitude: number;
  selected: SelectedLocation | null;
  onPick: (lat: number, lon: number) => void;
};

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function Recenter({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    map.setView([latitude, longitude], 15, { animate: true });
  }, [latitude, longitude, map]);

  return null;
}

function ClickPicker({
  onPick,
}: {
  onPick: (lat: number, lon: number) => void;
}) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  selected,
  onPick,
}: LocationPickerMapProps) {
  const hasValidCenter =
    Number.isFinite(latitude) && Number.isFinite(longitude);

  const hasValidSelected =
    !!selected &&
    Number.isFinite(selected.latitude) &&
    Number.isFinite(selected.longitude);

  if (!hasValidCenter) {
    return null;
  }

  return (
    <div style={{ height: 360, width: "100%" }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Recenter latitude={latitude} longitude={longitude} />
        <ClickPicker onPick={onPick} />

        {hasValidSelected ? (
          <Marker position={[selected.latitude, selected.longitude]} />
        ) : null}
      </MapContainer>
    </div>
  );
}
