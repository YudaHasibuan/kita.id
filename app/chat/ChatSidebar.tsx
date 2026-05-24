"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ChatSidebar({ conversations, currentUser }: { conversations: any[], currentUser: any }) {
  const pathname = usePathname();

  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-4 text-center text-white/50 text-sm mt-10">
        Belum ada percakapan. Mulai chat dari profil pengguna lain!
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {conversations.map((conv) => {
        // Cari partisipan selain user saat ini
        const otherParticipant = conv.participants.find((p: any) => p.userId !== currentUser.id)?.user;
        const chatName = conv.isGroup ? conv.name : otherParticipant?.name || "User";
        const chatImage = conv.isGroup ? null : otherParticipant?.image;
        const lastMessage = conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;
        const isActive = pathname === `/chat/${conv.id}`;

        return (
          <Link
            key={conv.id}
            href={`/chat/${conv.id}`}
            className={`chat-item ${isActive ? "active" : ""}`}
          >
            <div className="chat-item-avatar">
              {chatImage ? (
                <img src={chatImage} alt={chatName} className="chat-item-avatar" />
              ) : (
                chatName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="chat-item-content">
              <div className="chat-item-header">
                <h3>{chatName}</h3>
                {lastMessage && (
                  <span>
                    {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <p className="chat-item-text">
                {lastMessage ? lastMessage.content : "Belum ada pesan."}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
