import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNotifications, markNotificationsAsRead } from "@/app/actions/notification";
import Link from "next/link";
import { Heart, MessageCircle, UserPlus, Bell } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotifikasiPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Tandai semua dibaca saat halaman ini dibuka
  await markNotificationsAsRead();
  
  const { notifications } = await getNotifications();

  const getIcon = (type: string) => {
    switch(type) {
      case "LIKE": return <Heart size={20} color="#ef4444" fill="#ef4444" />;
      case "COMMENT": return <MessageCircle size={20} color="#3b82f6" />;
      case "FOLLOW": return <UserPlus size={20} color="#10b981" />;
      default: return <Bell size={20} color="#8b5cf6" />;
    }
  };

  const getLink = (notif: any) => {
    if (notif.postId) return `/post/${notif.postId}`;
    if (notif.triggerUser?.id) return `/profile/${notif.triggerUser.id}`;
    return "#";
  };

  return (
    <main style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={28} /> Notifikasi
        </h1>
        <p style={{ color: 'var(--muted)', margin: 0 }}>Lihat siapa yang berinteraksi dengan Anda.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!notifications || notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--line)' }}>
            Belum ada notifikasi saat ini.
          </div>
        ) : (
          notifications.map((notif: any) => (
            <Link key={notif.id} href={getLink(notif)} style={{ textDecoration: 'none', color: 'inherit' }}>
              <article style={{ 
                display: 'flex', 
                gap: '16px', 
                padding: '16px', 
                background: notif.isRead ? 'var(--card-bg)' : 'rgba(16, 167, 233, 0.05)', 
                borderRadius: '16px',
                border: '1px solid var(--line)',
                alignItems: 'center',
                transition: 'background 0.2s'
              }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0, 
                  background: 'var(--line)', display: 'grid', placeItems: 'center', overflow: 'hidden'
                }}>
                  {notif.triggerUser?.image ? (
                    <img src={notif.triggerUser.image} alt={notif.triggerUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontWeight: 'bold' }}>{notif.triggerUser?.name?.charAt(0) || "U"}</span>
                  )}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 4px 0', lineHeight: 1.4 }}>
                    <strong>{notif.triggerUser?.name}</strong> {notif.content}
                  </p>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {new Date(notif.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.5)', borderRadius: '50%' }}>
                  {getIcon(notif.type)}
                </div>
              </article>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
