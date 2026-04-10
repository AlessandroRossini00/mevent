// uso nel componente
"use client";

import { useChat } from "@/features/chat/hooks/use-chat";
import { useState } from "react";

export default function ChatBox() {
  const { messages, loading, onSend } = useChat();
  const [message, setMessage] = useState("");

  return (
    <div
      style={{
        gap: 12,
        position: "relative",
        flexDirection: "row",
      }}
    >
      {messages.map((m) => (
        <p key={m.id}>{m.text + " " + m.id}</p>
      ))}
      <button
        onClick={() => onSend(message)}
        disabled={loading}
        className="mr-8"
      >
        <span style={{ color: loading ? "grey" : "blue" }}>Invia</span>
      </button>
      <input
        type="text"
        style={{ background: "red" }}
        onChange={(e) => setMessage(e.target.value)}
      ></input>
    </div>
  );
}
