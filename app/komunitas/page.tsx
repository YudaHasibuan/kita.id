import { auth } from "@/lib/auth";
import Link from "next/link";
import { getCommunities, toggleCommunityMembership, createCommunity } from "@/app/actions/community";
import { UsersRound, ArrowLeft, Plus, Search } from "lucide-react";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Home, MessagesSquare, CalendarDays, Bell } from "lucide-react";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Beranda", icon: Home, href: "/" },
  { label: "Komunitas", icon: UsersRound, href: "/komunitas", active: true },
  { label: "Chat", icon: MessagesSquare, href: "/chat" },
  { label: "Event", icon: CalendarDays, href: "/event" },
  { label: "Notifikasi", icon: Bell, href: "/notifikasi" }
];

export default async function KomunitasPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  const { communities } = await getCommunities();

  return (
    <main className="app-shell">
      {/* SIDEBAR (Konsisten dengan App Utama) */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">K</div>
          <div>
            <strong>KITA.ID</strong>
            <span>Cerita Kita, Suara Kita.</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Navigasi utama">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href || "#"} key={item.label} style={{ textDecoration: 'none' }}>
                <button className={item.active ? "active" : ""} style={{ width: '100%', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                  <Icon size={20} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              </Link>
            );
          })}
        </nav>

        <button className="compose-main">
          <Plus size={20} aria-hidden="true" />
          Buat Post
        </button>

        <Link href="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
          <section className="profile-mini" aria-label="Profil pengguna" style={{ cursor: 'pointer' }}>
            {user?.image ? (
              <img alt="Foto profil user" src={user.image} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--line)', display: 'grid', placeItems: 'center', fontWeight: 'bold' }}>
                {user?.name?.charAt(0) || 'K'}
              </div>
            )}
            <div>
              <strong>{user?.name || "Pengguna"}</strong>
              <span>{user?.handle || "@pengguna"}</span>
            </div>
          </section>
        </Link>
      </aside>

      {/* FEED COLUMN (Tengah) */}
      <section className="feed-column" style={{ padding: '24px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Link href="/" style={{ textDecoration: 'none', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '16px' }}>
              <ArrowLeft size={16} /> Kembali ke Beranda
            </Link>
            <h1 style={{ fontSize: '32px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UsersRound size={32} /> Komunitas
            </h1>
            <p style={{ color: 'var(--muted)', margin: 0 }}>Temukan dan bergabung dengan komunitas yang sesuai minatmu.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="search-box" style={{ background: 'rgba(255,255,255,0.94)', border: '1px solid var(--line)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Search size={18} color="var(--muted)" />
            <input placeholder="Cari komunitas..." style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: 'var(--text)' }} />
          </div>

          {!communities || communities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', background: 'rgba(255,255,255,0.94)', borderRadius: '16px', border: '1px solid var(--line)' }}>
              Belum ada komunitas. Jadilah yang pertama membuatnya!
            </div>
          ) : (
            communities.map((community: any) => (
              <article key={community.id} style={{
                background: 'rgba(255,255,255,0.94)',
                border: '1px solid var(--line)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                transition: 'box-shadow 0.2s',
              }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '16px', flexShrink: 0,
                  background: community.color, display: 'grid', placeItems: 'center',
                  color: 'white', fontSize: '24px', fontWeight: 'bold'
                }}>
                  {community.name.charAt(0).toUpperCase()}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/komunitas/${community.id}`} style={{ textDecoration: 'none', color: 'var(--text)' }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{community.name}</h3>
                  </Link>
                  <p style={{ margin: '0 0 8px 0', color: 'var(--muted)', fontSize: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {community.description || "Tidak ada deskripsi."}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
                    <span>{community._count.members} Anggota</span>
                    <span>•</span>
                    <span>{community._count.posts} Post</span>
                    <span>•</span>
                    <span>{community.status}</span>
                  </div>
                </div>

                <form action={async () => {
                  "use server";
                  await toggleCommunityMembership(community.id);
                }}>
                  <button type="submit" style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: community.isMember ? '1px solid var(--line)' : 'none',
                    background: community.isMember ? 'transparent' : 'var(--primary)',
                    color: community.isMember ? 'var(--text)' : 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}>
                    {community.isMember ? 'Joined' : 'Join'}
                  </button>
                </form>
              </article>
            ))
          )}
        </div>
      </section>

      {/* RIGHT PANEL (Kanan) */}
      <aside className="right-panel">
        <div style={{ background: 'rgba(255,255,255,0.94)', border: '1px solid var(--line)', borderRadius: '16px', padding: '24px', position: 'sticky', top: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} /> Buat Komunitas
          </h3>
          <form action={createCommunity} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Nama Komunitas *</label>
              <input name="name" required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }} placeholder="Misal: Pecinta Kucing BDG" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Deskripsi</label>
              <textarea name="description" rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', outline: 'none', resize: 'vertical' }} placeholder="Apa tujuan komunitas ini?"></textarea>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Privasi</label>
              <select name="status" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}>
                <option value="Public">Publik (Semua bisa join & lihat)</option>
                <option value="Private">Privat (Hanya undangan)</option>
              </select>
            </div>
            <button type="submit" style={{ padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
              Buat Komunitas Baru
            </button>
          </form>
        </div>
      </aside>
    </main>
  );
}
