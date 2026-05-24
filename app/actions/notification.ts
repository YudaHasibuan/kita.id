"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Belum login" };

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      include: {
        triggerUser: {
          select: { id: true, name: true, image: true, handle: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    return { notifications };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function markNotificationsAsRead() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Belum login" };

  try {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true }
    });
    revalidatePath("/notifikasi");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
