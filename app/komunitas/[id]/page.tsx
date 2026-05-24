import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, UsersRound, Send, ImagePlus, Heart, MessageCircle, Repeat2, Share2, MessagesSquare, Home, CalendarDays, Bell, Plus } from "lucide-react";
import { getPosts, createPost, toggleLike } from "@/app/actions/post";
import { toggleCommunityMembership } from "@/app/actions/community";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Beranda", icon: Home, href: "/" },
  { label: "Komunitas", icon: UsersRound, href: "/komunitas", active: true },
  { label: "Chat", icon: MessagesSquare, href: "/chat" },
  { label: "Event", icon: CalendarDays, href: "/event" },
  { label: "Notifikasi", icon: Bell, href: "/notifikasi" }
];

export default async function KomunitasDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const user = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id } }) : null;

  const community = await prisma.community.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { members: true, posts: true } },
      members: {
        where: { userId: session.user.id }
      },
      owner: { select: { name: true } }
    }
  });

  if (!community) return notFound();

  const isMember = community.members.length > 0;
  const dbPosts = await getPosts(undefined, community.id);

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
      <section className="feed-column" style={{ padding: '0', overflowY: 'auto' }}>
        {/* Header / Cover Komunitas */}
        <div style={{ background: community.color, height: '160px', position: 'relative' }}>
          <Link href="/komunitas" style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '20px', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            <ArrowLeft size={16} /> Kembali
          </Link>
        </div>

        <div style={{ padding: '0 24px', marginTop: '-50px', position: 'relative', zIndex: 10, display: 'flex', gap: '20px', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: '#ffffff', border: '6px solid #ffffff', display: 'grid', placeItems: 'center', fontSize: '40px', fontWeight: 'bold', color: community.color, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
            {community.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, paddingBottom: '8px' }}>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '28px' }}>{community.name}</h1>
            <p style={{ margin: 0, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UsersRound size={16} /> {community._count.members} Anggota • Dibuat oleh {community.owner.name}
            </p>
          </div>
          <form action={async () => {
            "use server";
            await toggleCommunityMembership(community.id);
          }} style={{ paddingBottom: '8px' }}>
            <button type="submit" style={{
              padding: '10px 24px', borderRadius: '24px', fontWeight: 'bold', cursor: 'pointer',
              border: isMember ? '1px solid var(--line)' : 'none',
              background: isMember ? 'transparent' : 'var(--primary)',
              color: isMember ? 'var(--text)' : 'white',
            }}>
              {isMember ? 'Keluar Komunitas' : 'Gabung Komunitas'}
            </button>
          </form>
        </div>

        <div style={{ padding: '0 24px' }}>
          <p style={{ color: 'var(--text)', lineHeight: 1.6, marginBottom: '32px' }}>
            {community.description || "Komunitas ini belum memiliki deskripsi."}
          </p>
        </div>

        <div style={{ padding: '0 24px' }}>
            {isMember ? (
              <section className="composer" aria-label="Buat posting komunitas" style={{ marginBottom: '24px' }}>
                {user?.image ? (
                  <img alt={`Avatar ${user.name}`} src={user.image} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--line)', display: 'grid', placeItems: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                    {user?.name?.charAt(0) || 'K'}
                  </div>
                )}
                <form action={createPost} className="composer-box">
                  <input type="hidden" name="communityId" value={community.id} />
                  <textarea name="content" placeholder={`Bagikan sesuatu ke ${community.name}...`} required />
                  <div className="composer-actions">
                    <button type="button">
                      <ImagePlus size={18} aria-hidden="true" /> Media
                    </button>
                    <button type="submit" className="post-button">
                      <Send size={18} aria-hidden="true" /> Kirim
                    </button>
                  </div>
                </form>
              </section>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.94)', padding: '24px', borderRadius: '16px', border: '1px solid var(--line)', textAlign: 'center', marginBottom: '24px', color: 'var(--muted)' }}>
                Anda harus bergabung dengan komunitas ini untuk dapat memposting.
              </div>
            )}

            <section className="post-list" aria-label="Feed komunitas">
              {dbPosts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                  Belum ada postingan di komunitas ini.
                </div>
              ) : (
                dbPosts.map((post) => (
                  <article className="post-card" key={post.id}>
                    <header className="post-header">
                      <Link href={`/profile/${post.author.id}`} style={{ display: 'contents' }}>
                        {post.author.image ? (
                          <img alt={`Avatar ${post.author.name}`} src={post.author.image} style={{ cursor: 'pointer' }} />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--line)', display: 'grid', placeItems: 'center', fontWeight: 'bold', cursor: 'pointer' }}>
                            {post.author.name?.charAt(0) || 'K'}
                          </div>
                        )}
                      </Link>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <Link href={`/profile/${post.author.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <strong style={{ cursor: 'pointer' }}>{post.author.name}</strong>
                          </Link>
                          <span>
                            {post.author.handle} - {new Date(post.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {user && post.author.id !== user.id && (
                          <form action={async (formData) => {
                            "use server";
                            const { startChatAction } = await import("@/app/actions/chat");
                            await startChatAction(formData);
                          }}>
                            <input type="hidden" name="userId" value={post.author.id} />
                            <button type="submit" style={{ padding: '4px 10px', background: '#edf8ff', color: 'var(--primary-dark)', borderRadius: '20px', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MessagesSquare size={14} /> Chat
                            </button>
                          </form>
                        )}
                      </div>
                    </header>
                    <Link href={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <p style={{ whiteSpace: 'pre-wrap', cursor: 'pointer' }}>{post.content}</p>
                    </Link>
                    <footer className="post-actions">
                      <form action={toggleLike.bind(null, post.id)} style={{ display: 'contents' }}>
                        <button type="submit" style={{ color: post.hasLiked ? '#ef4444' : 'inherit' }}>
                          <Heart size={18} fill={post.hasLiked ? '#ef4444' : 'none'} aria-hidden="true" />
                          {post._count.likes}
                        </button>
                      </form>
                      <Link href={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <button>
                          <MessageCircle size={18} aria-hidden="true" />
                          {post._count.comments}
                        </button>
                      </Link>
                      <button><Repeat2 size={18} aria-hidden="true" /> {post._count.reposts}</button>
                      <button aria-label="Bagikan"><Share2 size={18} aria-hidden="true" /></button>
                    </footer>
                  </article>
                ))
              )}
            </section>
        </div>
      </section>
      
      {/* RIGHT PANEL (Kosong atau diisi rules) */}
      <aside className="right-panel">
        <section className="panel-section">
          <div className="section-title">
            <h2>Tentang Komunitas</h2>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>
            {community.description || "Komunitas ini adalah tempat berkumpulnya orang-orang dengan minat yang sama."}
          </p>
          <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--muted)' }}>
            <strong>Privasi:</strong> {community.status}
          </div>
        </section>
      </aside>
    </main>
  );
}
