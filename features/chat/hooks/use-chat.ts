// features/chat/hooks/use-chat.ts
"use client";

import { useState } from "react";
import { useChatStore } from "../store/chat";
import { sendMessage } from "../services/chat";

export function useChat() {
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const [loading, setLoading] = useState(false);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const onSend = async (text: string) => {
    setLoading(true);
    await sleep(1200);
    const msg = await sendMessage(text);
    addMessage(msg);
    setLoading(false);
  };

  return { messages, loading, onSend };
}
