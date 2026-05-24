import { getPostById, toggleLike, addComment } from "@/app/actions/post";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Heart, MessageCircle, Repeat2, Share2, Send, ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const post = await getPostById(params.id);
  
  if (!post) {
    return notFound();
  }

  const session = await auth();
  const user = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id } }) : null;

  return (
    <main className="app-shell">
      <section className="feed-column" style={{ borderRight: '1px solid var(--line)', minHeight: '100vh', margin: '0 auto', flex: 1, maxWidth: '600px' }}>
        <header className="topbar" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', zIndex: 10, borderBottom: '1px solid var(--line)' }}>
          <Link href="/" style={{ color: 'inherit' }}>
            <ArrowLeft size={24} />
          </Link>
          <h1 style={{ fontSize: '20px', margin: 0 }}>Postingan</h1>
        </header>

        <article className="post-card" style={{ border: 'none', borderBottom: '1px solid var(--line)', borderRadius: 0 }}>
          <header className="post-header">
            {post.author.image ? (
              <img alt={`Avatar ${post.author.name}`} src={post.author.image} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--line)', display: 'grid', placeItems: 'center', fontWeight: 'bold' }}>
                {post.author.name?.charAt(0) || 'K'}
              </div>
            )}
            <div>
              <strong>{post.author.name}</strong>
              <span>
                {post.author.handle} - {new Date(post.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </header>
          
          <p style={{ whiteSpace: 'pre-wrap', fontSize: '18px', marginTop: '12px' }}>{post.content}</p>
          
          <footer className="post-actions" style={{ marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
            <form action={toggleLike.bind(null, post.id)} style={{ display: 'contents' }}>
              <button type="submit" style={{ color: post.hasLiked ? '#ef4444' : 'inherit' }}>
                <Heart size={20} fill={post.hasLiked ? '#ef4444' : 'none'} aria-hidden="true" />
                {post._count.likes}
              </button>
            </form>
            <button style={{ color: '#0ea5e9' }}>
              <MessageCircle size={20} aria-hidden="true" />
              {post._count.comments}
            </button>
            <button>
              <Repeat2 size={20} aria-hidden="true" />
              {post._count.reposts}
            </button>
            <button aria-label="Bagikan">
              <Share2 size={20} aria-hidden="true" />
            </button>
          </footer>
        </article>

        {/* Form Komentar */}
        <section style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
          <form action={addComment} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <input type="hidden" name="postId" value={post.id} />
            {user?.image ? (
              <img alt="Avatar" src={user.image} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--line)', display: 'grid', placeItems: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                {user?.name?.charAt(0) || 'K'}
              </div>
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea 
                name="content" 
                placeholder="Balas postingan ini..." 
                required 
                style={{ width: '100%', minHeight: '80px', border: '1px solid var(--line)', borderRadius: '8px', padding: '12px', resize: 'none', fontFamily: 'inherit', outline: 'none' }}
              />
              <button type="submit" className="post-button" style={{ alignSelf: 'flex-end', padding: '8px 16px', borderRadius: '20px' }}>
                Balas
              </button>
            </div>
          </form>
        </section>

        {/* Daftar Komentar */}
        <section>
          {post.comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              Belum ada balasan.
            </div>
          ) : (
            post.comments.map((comment) => (
              <article key={comment.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', gap: '12px' }}>
                {comment.author.image ? (
                  <img alt="Avatar" src={comment.author.image} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--line)', display: 'grid', placeItems: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                    {comment.author.name?.charAt(0) || 'K'}
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '15px' }}>{comment.author.name}</strong>
                    <span style={{ color: 'var(--muted)', fontSize: '14px' }}>{comment.author.handle}</span>
                    <span style={{ color: 'var(--muted)', fontSize: '14px' }}>·</span>
                    <span style={{ color: 'var(--muted)', fontSize: '14px' }}>{new Date(comment.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                  <p style={{ marginTop: '4px', fontSize: '15px', whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                </div>
              </article>
            ))
          )}
        </section>
      </section>
    </main>
  );
}
