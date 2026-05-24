import { getConversations } from "@/app/actions/chat";
import ChatSidebar from "./ChatSidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100vh', padding: '10px 20px' }}>
      {/* Navigation Top Bar */}
      <div style={{ display: 'flex', gap: '16px', padding: '10px 0', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, transition: 'color 0.2s' }}>
          <Home size={18} /> Beranda
        </Link>
        <span style={{ color: 'var(--line)' }}>|</span>
        <a href="javascript:history.back()" style={{ textDecoration: 'none', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, transition: 'color 0.2s' }}>
          <ArrowLeft size={18} /> Kembali
        </a>
      </div>

      {/* Main Chat Area */}
      <div className="chat-layout" style={{ margin: '0', height: 'calc(100vh - 60px)', width: '100%' }}>
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2>Pesan</h2>
          </div>
          <div className="chat-sidebar-list">
            <ChatSidebar conversations={conversations || []} currentUser={session.user} />
          </div>
        </div>
        <div className="chat-main">
          {children}
        </div>
      </div>
    </div>
  );
}
