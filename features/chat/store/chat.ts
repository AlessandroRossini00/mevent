// features/chat/store/chat.store.ts
import { create } from "zustand";

type Message = { id: string; text: string };

type ChatState = {
  messages: Message[];
  addMessage: (m: Message) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
}));
