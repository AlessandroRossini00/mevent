export type EventMessageType = "text" | "system";

export type ChatSender = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
};

export type EventMessage = {
  id: string;
  event_id: string;
  sender_id: string;
  body: string;
  message_type: EventMessageType;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  sender: ChatSender | null;
};
