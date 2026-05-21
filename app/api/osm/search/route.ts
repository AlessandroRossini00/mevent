import { NextResponse } from "next/server";

type SearchHit = {
  place_id: number;
  display_name: string;
  lat: number;
  lon: number;
  name: string | null;
  address: string | null;
};

function getUserAgent() {
  // Nominatim richiede un User-Agent identificabile per l'uso corretto delle API.
  return (
    process.env.OSM_USER_AGENT ?? "mevent/0.1 (dev; contact: dev@localhost)"
  );
}

function mapSearchResults(list: any[]): SearchHit[] {
  return list.map((item) => {
    const address = item.address ?? {};

    // Proviamo a costruire un nome più compatto e leggibile del luogo:
    // se non esiste item.name, usiamo campi address progressivamente più generici.
    const name =
      item.name ??
      address.attraction ??
      address.amenity ??
      address.building ??
      address.road ??
      address.suburb ??
      address.city ??
      address.town ??
      address.village ??
      null;

    return {
      place_id: Number(item.place_id),
      display_name: item.display_name ?? "",
      lat: Number(item.lat),
      lon: Number(item.lon),
      name,
      address: item.display_name ?? null,
    };
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  // Blocchiamo query troppo corte per evitare richieste inutili
  // e risultati poco significativi da Nominatim.
  if (!q || q.length < 3) {
    return NextResponse.json({ error: "Query troppo corta." }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "8");
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
      { error: `Search failed: ${res.status}` },
      { status: 500 },
    );
  }

  const data = await res.json();

  // Normalizziamo la risposta grezza di Nominatim
  // nel formato usato dal picker location lato client.
  return NextResponse.json(mapSearchResults(data));
}
