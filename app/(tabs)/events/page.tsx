// app/(tabs)/home/page.tsx
import Link from "next/link";
import ChatBox from "@/features/chat/components/ChatBox";
export default function ExplorePage() {
  return (
    <div>
      <h1>EVENTS</h1>
      <ChatBox></ChatBox>
    </div>
  );
}
