"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Mengambil daftar percakapan pengguna (Inbox)
export async function getConversations() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Belum login" };
  const userId = session.user.id;

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: userId },
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, handle: true, image: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    return { conversations };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Mendapatkan pesan dari sebuah percakapan
export async function getMessages(conversationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Belum login" };

  try {
    // Validasi apakah user bagian dari percakapan
    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: session.user.id },
    });

    if (!isParticipant) return { error: "Tidak memiliki akses" };

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return { messages };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Mencari atau membuat percakapan DM baru
export async function findOrCreateDirectConversation(otherUserId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Belum login" };
  const userId = session.user.id;

  if (userId === otherUserId) return { error: "Tidak bisa chat diri sendiri" };

  try {
    // Cek apakah percakapan DM antara 2 user ini sudah ada
    const existingConvos = await prisma.conversation.findMany({
      where: {
        isGroup: false,
        participants: {
          every: {
            userId: { in: [userId, otherUserId] }
          }
        }
      },
      include: {
        participants: true
      }
    });

    const exactMatch = existingConvos.find(
      (c) => c.participants.length === 2 && 
             c.participants.some(p => p.userId === userId) && 
             c.participants.some(p => p.userId === otherUserId)
    );

    if (exactMatch) {
      return { conversationId: exactMatch.id };
    }

    // Buat percakapan baru
    const newConversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: userId },
            { userId: otherUserId }
          ]
        }
      }
    });

    revalidatePath("/chat");
    return { conversationId: newConversation.id };

  } catch (error: any) {
    return { error: error.message };
  }
}

// Mengirim pesan baru
export async function sendMessage(conversationId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Belum login" };
  const userId = session.user.id;

  if (!content.trim()) return { error: "Pesan kosong" };

  try {
    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });

    if (!isParticipant) return { error: "Tidak memiliki akses" };

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, image: true } }
      }
    });

    // Update lastMessageAt di Conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    revalidatePath("/chat");
    return { message };
  } catch (error: any) {
    return { error: error.message };
  }
}
