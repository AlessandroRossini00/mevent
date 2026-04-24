export type EventStatus = "active" | "cancelled" | "completed";
export type EventVisibility = "public" | "private";
export type EventApprovalMode = "open" | "approval_required";
export type EventMemberRole = "member" | "admin";

export type EventImage = {
  id: string;
  event_id: string;
  image_url: string;
  created_at: string;
};

export type EventMemberProfile = {
  id: string;
  username: string | null;
  full_name: string;
  birth_date: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
};

export type EventMember = {
  event_id: string;
  user_id: string;
  role: EventMemberRole;
  joined_at: string;
  profile: EventMemberProfile | null;
};

export type EventBase = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  category: string | null;
  event_at: string;
  location_name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  price: number;
  website_url: string | null;
  maps_url: string | null;
  max_members: number | null;
  visibility: EventVisibility;
  approval_mode: EventApprovalMode;
  status: EventStatus;
  created_at: string;
  updated_at: string;
};

export type EventWithRelations = EventBase & {
  event_images?: EventImage[];
  event_members?: EventMember[];
};

export type JoinedEvent = EventWithRelations;
export type CreatedEvent = EventWithRelations;
