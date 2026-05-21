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

// In alcuni setup bundler Leaflet non riesce a risolvere correttamente
// le icone di default del marker, quindi le configuriamo esplicitamente.
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

    // Quando cambia la posizione "attiva" riallineiamo la vista della mappa
    // per tenere il punto scelto sempre al centro.
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
      // Il click sulla mappa non salva direttamente il dato finale:
      // inoltra solo le coordinate al parent, che poi completa il reverse geocoding.
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

  // Se non abbiamo coordinate valide per il centro iniziale
  // evitiamo di montare una mappa in stato incoerente.
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
          // Mostriamo il marker solo quando esiste una posizione selezionata valida.
          <Marker position={[selected.latitude, selected.longitude]} />
        ) : null}
      </MapContainer>
    </div>
  );
}
