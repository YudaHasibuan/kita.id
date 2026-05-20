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
import { chats, communities, posts, stories, trends } from "./data";

const navItems = [
  { label: "Beranda", icon: Home, active: true },
  { label: "Komunitas", icon: UsersRound },
  { label: "Chat", icon: MessagesSquare },
  { label: "Event", icon: CalendarDays },
  { label: "Notifikasi", icon: Bell }
];

export default function HomePage() {
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
              <button className={item.active ? "active" : ""} key={item.label}>
                <Icon size={20} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button className="compose-main">
          <Plus size={20} aria-hidden="true" />
          Buat Post
        </button>

        <section className="profile-mini" aria-label="Profil pengguna">
          <img
            alt="Foto profil user"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80"
          />
          <div>
            <strong>Dimas Arya</strong>
            <span>@dimasarya</span>
          </div>
        </section>
      </aside>

      <section className="feed-column">
        <header className="topbar">
          <div>
            <span className="eyebrow">Selamat datang, Dimas</span>
            <h1>Temukan cerita seru di sekitarmu</h1>
            <p>Ikuti update teman, komunitas kampus, event lokal, dan obrolan yang dekat dengan harimu.</p>
          </div>
          <button className="icon-button" aria-label="Cari">
            <Search size={20} />
          </button>
        </header>

        <section className="welcome-strip" aria-label="Ringkasan aktivitas">
          <article>
            <strong>124</strong>
            <span>post baru</span>
          </article>
          <article>
            <strong>18</strong>
            <span>event dekatmu</span>
          </article>
          <article>
            <strong>7</strong>
            <span>chat aktif</span>
          </article>
        </section>

        <section className="story-rail" aria-label="Story komunitas">
          {stories.map((story) => (
            <article className="story" key={story.name}>
              <img alt={`Story ${story.name}`} src={story.image} />
              <strong>{story.name}</strong>
              <span>{story.city}</span>
            </article>
          ))}
        </section>

        <section className="composer" aria-label="Buat posting">
          <img
            alt="Avatar Dimas Arya"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80"
          />
          <div className="composer-box">
            <textarea placeholder="Apa cerita lokalmu hari ini?" />
            <div className="composer-actions">
              <button>
                <ImagePlus size={18} aria-hidden="true" />
                Media
              </button>
              <button className="post-button">
                <Send size={18} aria-hidden="true" />
                Kirim
              </button>
            </div>
          </div>
        </section>

        <section className="tabs" aria-label="Filter feed">
          <button className="selected">Untuk Kamu</button>
          <button>Following</button>
          <button>Komunitas</button>
          <button>Terdekat</button>
        </section>

        <section className="post-list" aria-label="Feed posting">
          {posts.map((post) => (
            <article className="post-card" key={post.author}>
              <header className="post-header">
                <img alt={`Avatar ${post.author}`} src={post.avatar} />
                <div>
                  <strong>{post.author}</strong>
                  <span>
                    {post.handle} - {post.location} - {post.time}
                  </span>
                </div>
              </header>
              <p>{post.content}</p>
              <div className="tag-row">
                {post.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <img className="post-image" alt={`Posting ${post.author}`} src={post.image} />
              <footer className="post-actions">
                <button>
                  <Heart size={18} aria-hidden="true" />
                  {post.likes}
                </button>
                <button>
                  <MessageCircle size={18} aria-hidden="true" />
                  {post.comments}
                </button>
                <button>
                  <Repeat2 size={18} aria-hidden="true" />
                  {post.reposts}
                </button>
                <button aria-label="Bagikan">
                  <Share2 size={18} aria-hidden="true" />
                </button>
              </footer>
            </article>
          ))}
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
            {communities.map((community) => (
              <article className="community-card" key={community.name}>
                <div className="community-mark" style={{ background: community.color }} />
                <div>
                  <strong>{community.name}</strong>
                  <span>
                    {community.members} anggota - {community.status}
                  </span>
                </div>
                <button>Join</button>
              </article>
            ))}
          </div>
        </section>

        <section className="panel-section">
          <div className="section-title">
            <h2>Chat</h2>
            <MessagesSquare size={18} aria-hidden="true" />
          </div>
          <div className="chat-list">
            {chats.map((chat) => (
              <article className="chat-row" key={chat.name}>
                <div className="chat-avatar">{chat.name.slice(0, 1)}</div>
                <div>
                  <strong>{chat.name}</strong>
                  <span>{chat.message}</span>
                </div>
                <div className="chat-meta">
                  <span>{chat.time}</span>
                  {chat.unread > 0 ? <b>{chat.unread}</b> : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel-section event-panel">
          <div>
            <h2>Meetup Kampus</h2>
            <p>Sabtu, 20.00 WIB - Bandung Creative Hub</p>
          </div>
          <button>
            <Bookmark size={17} aria-hidden="true" />
            RSVP
          </button>
        </section>
      </aside>
    </main>
  );
}
