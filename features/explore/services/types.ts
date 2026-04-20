export type ExploreEvent = {
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
  visibility: "public" | "private";
  approval_mode: "open" | "approval_required";
  status: "active" | "cancelled" | "completed";
  created_at: string;
  updated_at: string;
  event_images?: {
    id: string;
    event_id: string;
    image_url: string;
    created_at: string;
  }[];
  event_members?: {
    event_id: string;
    user_id: string;
    role: "member" | "admin";
    joined_at: string;
  }[];
};
