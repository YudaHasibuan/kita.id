import { auth } from "@/lib/auth";
import Link from "next/link";
import { getEvents, toggleRSVP, createEvent } from "@/app/actions/event";
import { CalendarDays, ArrowLeft, Plus, UsersRound, Home, MessagesSquare, Bell, MapPin, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Beranda", icon: Home, href: "/" },
  { label: "Komunitas", icon: UsersRound, href: "/komunitas" },
  { label: "Chat", icon: MessagesSquare, href: "/chat" },
  { label: "Event", icon: CalendarDays, href: "/event", active: true },
  { label: "Notifikasi", icon: Bell, href: "/notifikasi" }
];

export default async function EventPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const { events } = await getEvents();

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
              <CalendarDays size={32} /> Event & Meetup
            </h1>
            <p style={{ color: 'var(--muted)', margin: 0 }}>Temukan acara menarik di sekitarmu dan perluas koneksimu.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', background: 'rgba(255,255,255,0.94)', borderRadius: '16px', border: '1px solid var(--line)' }}>
              Belum ada event mendatang. Buat event pertama sekarang!
            </div>
          ) : (
            events.map((event: any) => {
              const eventDate = new Date(event.date);
              const formattedDate = eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
              const formattedTime = eventDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

              return (
                <article key={event.id} style={{
                  background: 'rgba(255,255,255,0.94)',
                  border: '1px solid var(--line)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: 'var(--text)' }}>{event.title}</h3>
                      <p style={{ margin: '0 0 12px 0', color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>
                        {event.description || "Tidak ada deskripsi."}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={16} color="var(--primary)" /> {formattedDate}, {formattedTime}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={16} color="var(--pink)" /> {event.location}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      background: 'var(--surface-soft)', color: 'var(--primary-dark)', padding: '12px', borderRadius: '12px', textAlign: 'center', minWidth: '80px', flexShrink: 0, border: '1px solid var(--line)'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>{eventDate.toLocaleDateString('id-ID', { month: 'short' })}</div>
                      <div style={{ fontSize: '24px', fontWeight: '900', lineHeight: 1 }}>{eventDate.getDate()}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>
                      <UsersRound size={16} /> {event._count.rsvps} Orang Hadir
                    </div>
                    
                    <form action={async () => {
                      "use server";
                      await toggleRSVP(event.id);
                    }}>
                      <button type="submit" style={{
                        padding: '8px 20px',
                        borderRadius: '20px',
                        border: event.isGoing ? '1px solid var(--line)' : 'none',
                        background: event.isGoing ? 'transparent' : 'var(--primary)',
                        color: event.isGoing ? 'var(--text)' : 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {event.isGoing ? 'Batal Hadir' : 'RSVP Sekarang'}
                      </button>
                    </form>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* RIGHT PANEL (Kanan) */}
      <aside className="right-panel">
        <div style={{ background: 'rgba(255,255,255,0.94)', border: '1px solid var(--line)', borderRadius: '16px', padding: '24px', position: 'sticky', top: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} /> Buat Event Baru
          </h3>
          <form action={createEvent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Nama Event *</label>
              <input name="title" required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }} placeholder="Misal: Meetup Dev Web" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Waktu Pelaksanaan *</label>
              <input type="datetime-local" name="date" required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Lokasi *</label>
              <input name="location" required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }} placeholder="Misal: Cafe Kopi Senja" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Deskripsi Tambahan</label>
              <textarea name="description" rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', outline: 'none', resize: 'vertical' }} placeholder="Detail acara..."></textarea>
            </div>
            <button type="submit" style={{ padding: '12px', background: 'linear-gradient(135deg, var(--primary), var(--pink))', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
              Publikasikan Event
            </button>
          </form>
        </div>
      </aside>
    </main>
  );
}
