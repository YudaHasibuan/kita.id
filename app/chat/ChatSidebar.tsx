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
            className={`flex items-center p-4 border-b border-white/5 hover:bg-white/10 transition-colors ${
              isActive ? "bg-white/10" : ""
            }`}
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-700 mr-4 flex-shrink-0">
              {chatImage ? (
                <img src={chatImage} alt={chatName} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50 text-xl font-bold">
                  {chatName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-white font-semibold truncate">{chatName}</h3>
                {lastMessage && (
                  <span className="text-xs text-white/40 flex-shrink-0 ml-2">
                    {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <p className="text-sm text-white/60 truncate">
                {lastMessage ? lastMessage.content : "Belum ada pesan."}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
