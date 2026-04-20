"use client";

import { create } from "zustand";
import type { EventMessage } from "@/features/chat/services/types";

type ChatState = {
  messagesByEvent: Record<string, EventMessage[]>;
  isLoadingByEvent: Record<string, boolean>;
  errorByEvent: Record<string, string | null>;
  setMessages: (eventId: string, messages: EventMessage[]) => void;
  addMessage: (eventId: string, message: EventMessage) => void;
  setLoading: (eventId: string, value: boolean) => void;
  setError: (eventId: string, value: string | null) => void;
  clearChat: (eventId: string) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messagesByEvent: {},
  isLoadingByEvent: {},
  errorByEvent: {},
  setMessages: (eventId, messages) =>
    set((state) => ({
      messagesByEvent: {
        ...state.messagesByEvent,
        [eventId]: messages,
      },
    })),
  addMessage: (eventId, message) =>
    set((state) => {
      const currentMessages = state.messagesByEvent[eventId] ?? [];
      const alreadyExists = currentMessages.some(
        (item) => item.id === message.id,
      );

      return {
        messagesByEvent: {
          ...state.messagesByEvent,
          [eventId]: alreadyExists
            ? currentMessages
            : [...currentMessages, message],
        },
      };
    }),
  setLoading: (eventId, value) =>
    set((state) => ({
      isLoadingByEvent: {
        ...state.isLoadingByEvent,
        [eventId]: value,
      },
    })),
  setError: (eventId, value) =>
    set((state) => ({
      errorByEvent: {
        ...state.errorByEvent,
        [eventId]: value,
      },
    })),
  clearChat: (eventId) =>
    set((state) => ({
      messagesByEvent: {
        ...state.messagesByEvent,
        [eventId]: [],
      },
      isLoadingByEvent: {
        ...state.isLoadingByEvent,
        [eventId]: false,
      },
      errorByEvent: {
        ...state.errorByEvent,
        [eventId]: null,
      },
    })),
}));
