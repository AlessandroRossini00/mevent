export const EVENT_LIMITS = {
  title: 60,
  description: 300,
  maxMembers: 20,
} as const;

export const MAX_USER_EVENTS = 20;

export const EVENT_CATEGORIES = [
  "music",
  "sport",
  "food",
  "tech",
  "art",
  "nightlife",
  "travel",
  "wellness",
  "networking",
  "games",
  "community",
  "outdoor",
  "other",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];
