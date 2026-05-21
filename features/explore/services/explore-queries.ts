import { createClient } from "@/lib/supabase/client";
import type { ExploreEvent } from "@/features/explore/services/types";
import {
  MAX_DISTANCE as MAX_DISTANCE_CAP,
  MIN_DISTANCE as MIN_DISTANCE_CAP,
  MAX_PRICE as MAX_PRICE_CAP,
} from "../constants";

const EVENTS_SELECT = `
  *,
  event_images (*),
  event_members (
    event_id,
    user_id,
    role,
    joined_at
  )
`;

type GetExploreEventsParams = {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  minPrice?: string;
  maxPrice?: string;
  minDistanceKm?: number;
  maxDistanceKm?: number;
  userLatitude?: number | null;
  userLongitude?: number | null;
  page: number;
  pageSize: number;
};

type GetExploreEventsResult = {
  events: ExploreEvent[];
  hasMore: boolean;
};

type SearchExploreEventIdsRow = {
  event_id: string;
  distance_km: number | null;
};

function toNullableNumber(value?: string) {
  // I filtri prezzo arrivano come stringhe dalla UI:
  // li convertiamo in number solo se il valore è valido.
  if (!value?.trim()) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function shouldUseDistanceRpc(params: GetExploreEventsParams) {
  const hasCoordinates =
    params.userLatitude !== null &&
    params.userLatitude !== undefined &&
    params.userLongitude !== null &&
    params.userLongitude !== undefined;

  const hasDistanceFilter =
    (params.minDistanceKm ?? 0) > 0 ||
    (params.maxDistanceKm ?? MAX_DISTANCE_CAP) < MAX_DISTANCE_CAP;

  // La query distanza richiede coordinate utente e almeno un filtro distanza attivo.
  // Se manca una delle due condizioni restiamo sulla query standard.
  return hasCoordinates && hasDistanceFilter;
}

async function fetchEventsByIds(
  eventIds: string[],
  pageSize: number,
): Promise<GetExploreEventsResult> {
  if (eventIds.length === 0) {
    return {
      events: [],
      hasMore: false,
    };
  }

  const supabase = createClient();

  // Chiediamo alla RPC pageSize + 1 id per capire se esistono altre pagine
  // senza dover eseguire una count separata.
  const hasMore = eventIds.length > pageSize;
  const pagedIds = eventIds.slice(0, pageSize);

  const { data, error } = await supabase
    .from("events")
    .select(EVENTS_SELECT)
    .in("id", pagedIds);

  if (error) throw error;

  const order = new Map(pagedIds.map((id, index) => [id, index]));

  // La select con .in("id", ...) non garantisce l'ordine originale degli id:
  // lo ricostruiamo manualmente per mantenere l'ordinamento deciso dalla RPC.
  const events = ((data ?? []) as ExploreEvent[]).sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
  );

  return {
    events,
    hasMore,
  };
}

export async function getExploreEventsQuery({
  category,
  dateFrom,
  dateTo,
  minPrice,
  maxPrice,
  minDistanceKm = MIN_DISTANCE_CAP,
  maxDistanceKm = MAX_DISTANCE_CAP,
  userLatitude,
  userLongitude,
  page,
  pageSize,
}: GetExploreEventsParams): Promise<GetExploreEventsResult> {
  const supabase = createClient();

  const { data: sessionData } = await supabase.auth.getSession();
  const currentUserId = sessionData.session?.user?.id ?? null;

  const offset = page * pageSize;
  const minPriceValue = toNullableNumber(minPrice);
  const maxPriceValue = toNullableNumber(maxPrice);

  if (
    shouldUseDistanceRpc({
      category,
      dateFrom,
      dateTo,
      minPrice,
      maxPrice,
      minDistanceKm,
      maxDistanceKm,
      userLatitude,
      userLongitude,
      page,
      pageSize,
    })
  ) {
    const { data, error } = await supabase.rpc("search_explore_event_ids", {
      p_user_id: currentUserId,
      p_category: category && category !== "all" ? category : null,
      p_date_from: dateFrom || null,
      p_date_to: dateTo ? `${dateTo}T23:59:59.999` : null,
      p_min_price: minPriceValue,
      p_max_price:
        maxPriceValue !== null && maxPriceValue < MAX_PRICE_CAP
          ? maxPriceValue
          : null,
      p_user_lat: userLatitude,
      p_user_lon: userLongitude,
      p_min_distance_km: minDistanceKm,
      p_max_distance_km:
        maxDistanceKm < MAX_DISTANCE_CAP ? maxDistanceKm : null,
      p_limit: pageSize + 1,
      p_offset: offset,
    });

    if (error) throw error;

    const rows = (data ?? []) as SearchExploreEventIdsRow[];
    const eventIds = rows.map((row) => row.event_id);

    // La RPC restituisce solo gli id ordinati/filtrati per distanza:
    // qui recuperiamo i record completi degli eventi.
    return fetchEventsByIds(eventIds, pageSize);
  }

  const from = page * pageSize;
  const to = from + pageSize;

  let query = supabase
    .from("events")
    .select(EVENTS_SELECT)
    .eq("status", "active")
    .eq("visibility", "public")
    .order("event_at", { ascending: true })
    .range(from, to);

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (dateFrom) {
    query = query.gte("event_at", dateFrom);
  }

  if (dateTo) {
    query = query.lte("event_at", `${dateTo}T23:59:59.999`);
  }

  if (minPriceValue !== null) {
    query = query.gte("price", minPriceValue);
  }

  if (maxPriceValue !== null && maxPriceValue < MAX_PRICE_CAP) {
    query = query.lte("price", maxPriceValue);
  }

  const { data, error } = await query;

  if (error) throw error;

  const rawEvents = (data ?? []) as ExploreEvent[];
  const hasMore = rawEvents.length > pageSize;

  const events = rawEvents.slice(0, pageSize).filter((event) => {
    if (!currentUserId) return true;

    const isMember =
      event.event_members?.some((member) => member.user_id === currentUserId) ??
      false;

    // Nell'explore non mostriamo eventi a cui l'utente partecipa già.
    return !isMember;
  });

  return {
    events,
    hasMore,
  };
}
