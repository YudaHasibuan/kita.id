"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: "Anda harus login untuk membuat postingan." };
  }

  const content = formData.get("content") as string;
  const communityId = formData.get("communityId") as string | null;
  
  if (!content || content.trim().length === 0) {
    return { error: "Konten postingan tidak boleh kosong." };
  }

  try {
    await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: session.user.id,
        communityId: communityId || null,
        // Untuk tahap awal, image & tags kita biarkan kosong/opsional
      },
    });

    // Refresh halaman utama agar postingan baru muncul
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Gagal membuat postingan." };
  }
}

export async function getPosts(tab?: string, communityId?: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    let whereClause: any = {};
    if (communityId) {
      whereClause.communityId = communityId;
    } else if (tab === 'following' && userId) {
      whereClause.author = {
        followers: {
          some: {
            followerId: userId
          }
        }
      };
      whereClause.communityId = null; // Opsional: sembunyikan post komunitas di feed utama
    } else {
      // Tampilkan post yang bukan milik komunitas di feed utama
      whereClause.communityId = null;
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, handle: true, image: true }
        },
        _count: {
          select: { likes: true, comments: true, reposts: true }
        },
        // Jika user login, cek apakah dia sudah like post ini
        ...(userId ? {
          likes: {
            where: { userId }
          }
        } : {})
      },
      take: 50
    });
    
    // Map hasilnya untuk menambahkan properti hasLiked yang lebih mudah dibaca frontend
    return posts.map(post => ({
      ...post,
      hasLiked: userId ? (post as any).likes?.length > 0 : false
    }));
  } catch (error) {
    console.error("Gagal mengambil postingan:", error);
    return [];
  }
}

export async function toggleLike(postId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Anda harus login untuk menyukai postingan." };
  }

  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: session.user.id
        }
      }
    });

    if (existingLike) {
      // Jika sudah like, maka unlike (hapus like)
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
    } else {
      // Jika belum like, tambahkan like
      await prisma.like.create({
        data: {
          postId: postId,
          userId: session.user.id
        }
      });

      // Dapatkan info post untuk notifikasi
      const postInfo = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true }
      });

      // Jangan kirim notif ke diri sendiri
      if (postInfo && postInfo.authorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            type: "LIKE",
            userId: postInfo.authorId,
            triggerId: session.user.id,
            postId: postId,
            content: "menyukai postingan Anda"
          }
        });
      }
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Gagal memproses like." };
  }
}

export async function getPostById(postId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { id: true, name: true, handle: true, image: true }
        },
        _count: {
          select: { likes: true, comments: true, reposts: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, handle: true, image: true }
            }
          },
          orderBy: { createdAt: "asc" }
        },
        ...(userId ? {
          likes: {
            where: { userId }
          }
        } : {})
      }
    });

    if (!post) return null;

    return {
      ...post,
      hasLiked: userId ? (post as any).likes?.length > 0 : false
    };
  } catch (error) {
    console.error("Gagal mengambil detail postingan:", error);
    return null;
  }
}

export async function addComment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Anda harus login untuk berkomentar." };
  }

  const postId = formData.get("postId") as string;
  const content = formData.get("content") as string;

  if (!postId || !content || content.trim().length === 0) {
    return { error: "Komentar tidak boleh kosong." };
  }

  try {
    await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: postId,
        authorId: session.user.id
      }
    });

    // Dapatkan info post untuk notifikasi
    const postInfo = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });

    if (postInfo && postInfo.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: "COMMENT",
          userId: postInfo.authorId,
          triggerId: session.user.id,
          postId: postId,
          content: "mengomentari postingan Anda"
        }
      });
    }

    revalidatePath(`/post/${postId}`);
    revalidatePath("/"); // Update comments count on home page
    return { success: true };
  } catch (error) {
    return { error: "Gagal menambahkan komentar." };
  }
}
