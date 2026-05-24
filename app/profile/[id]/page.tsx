import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { startChatAction } from "@/app/actions/chat";
import { toggleFollow } from "@/app/actions/profile";
import { MessagesSquare, UserPlus, UserMinus, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const session = await auth();
  const targetUserId = params.id;

  // Jika user melihat profilnya sendiri, redirect ke /profile
  if (session?.user?.id === targetUserId) {
    redirect("/profile");
  }

  // Ambil data user target beserta follower/following
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        }
      }
    }
  });

  if (!user) {
    notFound();
  }

  // Cek apakah current user sudah follow target user
  let isFollowing = false;
  if (session?.user?.id) {
    const followRecord = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId
        }
      }
    });
    isFollowing = !!followRecord;
  }

  return (
    <main className="app-shell" style={{ display: 'block', maxWidth: '800px', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Kembali
        </Link>
      </div>

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.9)', 
        borderRadius: '16px', 
        padding: '32px', 
        boxShadow: '0 18px 50px rgba(24, 34, 48, 0.08)',
        border: '1px solid var(--line)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Banner dekoratif */}
        <div style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, height: '120px', 
          background: 'linear-gradient(135deg, rgba(16, 167, 233, 0.2), rgba(243, 93, 157, 0.2))',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            margin: '20px auto 16px',
            border: '4px solid white',
            background: 'linear-gradient(135deg, var(--primary), var(--pink))',
            display: 'grid',
            placeItems: 'center',
            color: 'white',
            fontSize: '48px',
            fontWeight: 'bold',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {user.image ? (
              <img src={user.image} alt={user.name || "User"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>

          <h1 style={{ fontSize: '28px', margin: '0 0 4px', color: 'var(--text)' }}>
            {user.name}
          </h1>
          <p style={{ margin: '0 0 16px', color: 'var(--muted)', fontSize: '15px' }}>
            {user.handle || "@pengguna"}
          </p>

          {user.bio && (
            <p style={{ maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.6, color: 'var(--text)' }}>
              {user.bio}
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <strong style={{ display: 'block', fontSize: '20px', color: 'var(--text)' }}>{user._count.posts}</strong>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Posts</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <strong style={{ display: 'block', fontSize: '20px', color: 'var(--text)' }}>{user._count.followers}</strong>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Followers</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <strong style={{ display: 'block', fontSize: '20px', color: 'var(--text)' }}>{user._count.following}</strong>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Following</span>
            </div>
          </div>

          {session?.user && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {/* Tombol Follow / Unfollow */}
              <form action={async () => {
                "use server";
                await toggleFollow(user.id);
              }}>
                <button type="submit" style={{
                  padding: '10px 24px',
                  borderRadius: '24px',
                  border: isFollowing ? '1px solid var(--line)' : 'none',
                  background: isFollowing ? 'white' : 'var(--primary)',
                  color: isFollowing ? 'var(--text)' : 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isFollowing ? 'none' : '0 4px 12px rgba(16, 167, 233, 0.3)',
                  transition: 'transform 0.2s'
                }}>
                  {isFollowing ? (
                    <><UserMinus size={18} /> Unfollow</>
                  ) : (
                    <><UserPlus size={18} /> Follow</>
                  )}
                </button>
              </form>

              {/* Tombol Chat - Hanya aktif jika sudah saling follow atau jika kita memfollow dia (sesuai instruksi) */}
              {isFollowing && (
                <form action={async (formData) => {
                  "use server";
                  await startChatAction(formData);
                }}>
                  <input type="hidden" name="userId" value={user.id} />
                  <button type="submit" style={{
                    padding: '10px 24px',
                    borderRadius: '24px',
                    border: '1px solid var(--line)',
                    background: '#edf8ff',
                    color: 'var(--primary-dark)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <MessagesSquare size={18} /> Message
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
