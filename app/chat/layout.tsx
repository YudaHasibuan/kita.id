import { getConversations } from "@/app/actions/chat";
import ChatSidebar from "./ChatSidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { conversations, error } = await getConversations();

  return (
    <div className="flex h-[calc(100vh-80px)] mt-20 max-w-6xl mx-auto border border-white/10 rounded-xl overflow-hidden bg-white/5 backdrop-blur-md">
      {/* Sidebar: List Chat */}
      <div className="w-1/3 min-w-[300px] border-r border-white/10 flex flex-col bg-black/20">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Pesan</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ChatSidebar conversations={conversations || []} currentUser={session.user} />
        </div>
      </div>

      {/* Main: Chat Window */}
      <div className="flex-1 flex flex-col bg-black/40">
        {children}
      </div>
    </div>
  );
}
