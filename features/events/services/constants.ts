export const EVENT_LIMITS = {
  title: 60,
  description: 300,
  maxMembers: 20,
} as const;

export const MAX_USER_EVENTS = 20;

export const EVENT_CATEGORIES = [
  "Music",
  "Sport",
  "Food",
  "Tech",
  "Art",
  "Nightlife",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];
