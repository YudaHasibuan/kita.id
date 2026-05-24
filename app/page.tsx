import {
  Bell,
  Bookmark,
  CalendarDays,
  Heart,
  Home,
  ImagePlus,
  MessageCircle,
  MessagesSquare,
  Plus,
  Repeat2,
  Search,
  Send,
  Share2,
  Sparkles,
  UsersRound
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { getPosts, createPost, toggleLike } from "./actions/post";
import { getConversations } from "./actions/chat";
import { getCommunities } from "./actions/community";
import { getEvents } from "./actions/event";
import { getStories } from "./actions/story";
import { trends } from "./data";
import StoryList from "@/components/StoryList";

const navItems = [
  { label: "Beranda", icon: Home, href: "/", active: true },
  { label: "Komunitas", icon: UsersRound, href: "/komunitas" },
  { label: "Chat", icon: MessagesSquare, href: "/chat" },
  { label: "Event", icon: CalendarDays, href: "/event" },
  { label: "Notifikasi", icon: Bell, href: "/notifikasi" }
];

export default async function HomePage({ searchParams }: { searchParams: { tab?: string } }) {
  const session = await auth();
  const user = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id } }) : null;
  
  const tab = searchParams.tab || "foryou";
  const dbPosts = await getPosts(tab);
  const { conversations } = await getConversations();
  const { communities } = await getCommunities();
  const { events } = await getEvents();
  const { stories } = await getStories();

  // Ambil jumlah notifikasi yang belum dibaca
  const unreadNotifs = session?.user?.id 
    ? await prisma.notification.count({ where: { userId: session.user.id, isRead: false } })
    : 0;

  return (
    <main className="app-shell">
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
                <button className={item.active ? "active" : ""} style={{ width: '100%', pointerEvents: 'none', display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <Icon size={20} aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.label === "Notifikasi" && unreadNotifs > 0 && (
                    <div style={{
                      position: 'absolute',
                      right: '12px',
                      background: '#ef4444',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '10px',
                    }}>
                      {unreadNotifs}
                    </div>
                  )}
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

      <section className="feed-column">
        <header className="topbar">
          <div>
            <span className="eyebrow">Selamat datang, {user?.name?.split(' ')[0] || "Teman"}</span>
            <h1>Temukan cerita seru di sekitarmu</h1>
            <p>Ikuti update teman, komunitas kampus, event lokal, dan obrolan yang dekat dengan harimu.</p>
          </div>
          <button className="icon-button" aria-label="Cari">
            <Search size={20} />
          </button>
        </header>

        <section className="welcome-strip" aria-label="Ringkasan aktivitas">
          <article>
            <strong>{dbPosts.length}</strong>
            <span>post baru</span>
          </article>
          <article>
            <strong>{events.length}</strong>
            <span>event mendatang</span>
          </article>
          <article>
            <strong>{conversations.length}</strong>
            <span>chat aktif</span>
          </article>
        </section>

        <StoryList stories={stories} />

        <section className="composer" aria-label="Buat posting">
          {user?.image ? (
            <img alt={`Avatar ${user.name}`} src={user.image} />
          ) : (
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--line)', display: 'grid', placeItems: 'center', fontWeight: 'bold', flexShrink: 0 }}>
              {user?.name?.charAt(0) || 'K'}
            </div>
          )}
          <form action={createPost} className="composer-box">
            <textarea name="content" placeholder="Apa cerita lokalmu hari ini?" required />
            <div className="composer-actions">
              <button type="button">
                <ImagePlus size={18} aria-hidden="true" />
                Media
              </button>
              <button type="submit" className="post-button">
                <Send size={18} aria-hidden="true" />
                Kirim
              </button>
            </div>
          </form>
        </section>

        <section className="tabs" aria-label="Filter feed" style={{ display: 'flex', gap: '8px' }}>
          <Link href="/?tab=foryou" style={{ textDecoration: 'none' }}>
            <button className={tab === 'foryou' ? 'selected' : ''}>Untuk Kamu</button>
          </Link>
          <Link href="/?tab=following" style={{ textDecoration: 'none' }}>
            <button className={tab === 'following' ? 'selected' : ''}>Following</button>
          </Link>
          <Link href="/?tab=komunitas" style={{ textDecoration: 'none' }}>
            <button className={tab === 'komunitas' ? 'selected' : ''}>Komunitas</button>
          </Link>
          <Link href="/?tab=terdekat" style={{ textDecoration: 'none' }}>
            <button className={tab === 'terdekat' ? 'selected' : ''}>Terdekat</button>
          </Link>
        </section>

        <section className="post-list" aria-label="Feed posting">
          {dbPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              Belum ada postingan. Jadilah yang pertama membagikan cerita!
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
                        const { startChatAction } = await import("./actions/chat");
                        await startChatAction(formData);
                      }}>
                        <input type="hidden" name="userId" value={post.author.id} />
                        <button type="submit" style={{ 
                          padding: '4px 10px', 
                          background: '#edf8ff', 
                          color: 'var(--primary-dark)', 
                          borderRadius: '20px', 
                          border: 'none', 
                          fontSize: '12px', 
                          fontWeight: 'bold', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <MessagesSquare size={14} /> Chat
                        </button>
                      </form>
                    )}
                  </div>
                </header>
                <Link href={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <p style={{ whiteSpace: 'pre-wrap', cursor: 'pointer' }}>{post.content}</p>
                </Link>
                {post.tags.length > 0 && (
                  <div className="tag-row">
                    {post.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                )}
                {post.image && (
                  <img className="post-image" alt={`Posting ${post.author.name}`} src={post.image} />
                )}
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
                  <button>
                    <Repeat2 size={18} aria-hidden="true" />
                    {post._count.reposts}
                  </button>
                  <button aria-label="Bagikan">
                    <Share2 size={18} aria-hidden="true" />
                  </button>
                </footer>
              </article>
            ))
          )}
        </section>
      </section>

      <aside className="right-panel">
        <section className="search-box">
          <Search size={18} aria-hidden="true" />
          <input placeholder="Cari komunitas, event, hashtag" />
        </section>

        <section className="panel-section">
          <div className="section-title">
            <h2>Trending Lokal</h2>
            <Sparkles size={18} aria-hidden="true" />
          </div>
          <div className="trend-list">
            {trends.map((trend, index) => (
              <button key={trend}>
                <span>{index + 1}</span>
                {trend}
              </button>
            ))}
          </div>
        </section>

        <section className="panel-section">
          <div className="section-title">
            <h2>Komunitas</h2>
            <UsersRound size={18} aria-hidden="true" />
          </div>
          <div className="community-list">
            {!communities || communities.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                Belum ada komunitas.
              </div>
            ) : (
              communities.slice(0, 4).map((community: any) => (
                <article className="community-card" key={community.name}>
                  <div className="community-mark" style={{ background: community.color, display: 'grid', placeItems: 'center', color: 'white', fontWeight: 'bold' }}>
                    {community.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/komunitas/${community.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <strong style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{community.name}</strong>
                    </Link>
                    <span>
                      {community._count.members} anggota - {community.status}
                    </span>
                  </div>
                  <Link href="/komunitas" style={{ textDecoration: 'none' }}>
                    <button style={{ padding: '6px 12px' }}>Lihat</button>
                  </Link>
                </article>
              ))
            )}
            {communities && communities.length > 4 && (
              <Link href="/komunitas" style={{ display: 'block', textAlign: 'center', fontSize: '13px', color: 'var(--primary)', marginTop: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                Lihat Semua ({communities.length})
              </Link>
            )}
          </div>
        </section>

        <section className="panel-section">
          <div className="section-title">
            <h2>Chat</h2>
            <MessagesSquare size={18} aria-hidden="true" />
          </div>
          <div className="chat-list">
            {!conversations || conversations.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                Belum ada obrolan.
              </div>
            ) : (
              conversations.map((conv) => {
                const otherParticipant = conv.participants.find(
                  (p: any) => p.user.id !== session?.user?.id
                );
                const chatName = conv.isGroup 
                  ? conv.name 
                  : otherParticipant?.user.name || "Unknown";
                const chatImage = !conv.isGroup ? otherParticipant?.user.image : null;
                const lastMessage = conv.messages[0];

                return (
                  <Link href={`/chat/${conv.id}`} key={conv.id} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <article className="chat-row" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
                      {chatImage ? (
                        <img src={chatImage} alt={chatName} className="chat-avatar" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div className="chat-avatar">{chatName?.slice(0, 1).toUpperCase()}</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                        <strong style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{chatName}</strong>
                        <span style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {lastMessage ? lastMessage.content : "Belum ada pesan."}
                        </span>
                      </div>
                      <div className="chat-meta">
                        <span>
                          {lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                    </article>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {events.slice(0, 1).map((event: any) => {
          const eventDate = new Date(event.date);
          const formattedDate = eventDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
          const formattedTime = eventDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

          return (
            <Link href="/event" key={event.id} style={{ textDecoration: 'none' }}>
              <section className="panel-section event-panel" style={{ cursor: 'pointer', borderRadius: '12px' }}>
                <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                  <h2 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</h2>
                  <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {formattedDate}, {formattedTime} - {event.location}
                  </p>
                </div>
                <button>
                  <Bookmark size={17} aria-hidden="true" />
                  RSVP
                </button>
              </section>
            </Link>
          );
        })}
        {events.length === 0 && (
          <section className="panel-section event-panel" style={{ borderRadius: '12px' }}>
            <div>
              <h2>Belum Ada Event</h2>
              <p>Jadilah yang pertama membuat meetup!</p>
            </div>
            <Link href="/event">
              <button>Buat</button>
            </Link>
          </section>
        )}
      </aside>
    </main>
  );
}
