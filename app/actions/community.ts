"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCommunities() {
  const session = await auth();
  
  try {
    const communities = await prisma.community.findMany({
      include: {
        _count: {
          select: { members: true, posts: true }
        },
        ...(session?.user?.id ? {
          members: {
            where: { userId: session.user.id }
          }
        } : {})
      },
      orderBy: { createdAt: "desc" }
    });

    return { 
      communities: communities.map(c => ({
        ...c,
        isMember: session?.user?.id ? c.members.length > 0 : false
      })) 
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createCommunity(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Belum login" };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as string || "Public";
  
  if (!name || name.trim().length === 0) {
    return { error: "Nama komunitas tidak boleh kosong." };
  }

  // Generate random color for community banner
  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  try {
    const community = await prisma.community.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        status,
        color,
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "Admin"
          }
        }
      }
    });

    revalidatePath("/komunitas");
    revalidatePath("/");
    return { success: true, communityId: community.id };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Nama komunitas sudah digunakan." };
    return { error: "Gagal membuat komunitas." };
  }
}

export async function toggleCommunityMembership(communityId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Belum login" };

  try {
    const existingMember = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId: session.user.id
        }
      }
    });

    if (existingMember) {
      // Keluar dari komunitas
      // Cek apakah dia owner? Jika owner (bukan sekedar admin di role) sebaiknya dicegah, tapi biarkan sederhana dulu
      const community = await prisma.community.findUnique({ where: { id: communityId }});
      if (community?.ownerId === session.user.id) {
         return { error: "Pemilik tidak bisa keluar dari komunitas. Hapus komunitas jika ingin." };
      }

      await prisma.communityMember.delete({
        where: { id: existingMember.id }
      });
    } else {
      // Gabung komunitas
      await prisma.communityMember.create({
        data: {
          communityId,
          userId: session.user.id
        }
      });
    }

    revalidatePath("/komunitas");
    revalidatePath(`/komunitas/${communityId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
