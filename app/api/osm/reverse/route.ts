import { NextResponse } from "next/server";

function getUserAgent() {
  // Nominatim richiede un User-Agent identificabile per l'uso delle API.
  return (
    process.env.OSM_USER_AGENT ?? "mevent/0.1 (dev; contact: dev@localhost)"
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lon);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "it");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": getUserAgent(),
      Accept: "application/json",
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Reverse failed: ${res.status}` },
      { status: 500 },
    );
  }

  const data = await res.json();
  const address = data?.address ?? {};

  // Cerchiamo un nome "umano" del luogo con una catena di fallback:
  // se Nominatim non restituisce un name chiaro, proviamo vari campi address
  // fino ad arrivare al display_name completo.
  const locationName =
    data?.name ??
    address.attraction ??
    address.amenity ??
    address.building ??
    address.road ??
    address.suburb ??
    address.city ??
    address.town ??
    address.village ??
    data?.display_name ??
    null;

  return NextResponse.json({
    location_name: locationName,
    address: data?.display_name ?? null,
    latitude: Number(data?.lat ?? lat),
    longitude: Number(data?.lon ?? lon),

    // Restituiamo anche una URL pronta per Google Maps,
    // così il client non deve ricostruirla ogni volta.
    maps_url: `https://www.google.com/maps?q=${data?.lat ?? lat},${data?.lon ?? lon}`,
  });
}
