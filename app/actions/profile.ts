"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Silakan login terlebih dahulu." };

  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;
  const handle = formData.get("handle") as string;

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name, bio, handle },
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return { error: "Gagal memperbarui profil. Mungkin username/handle sudah terpakai oleh pengguna lain." };
  }
}

export async function uploadAvatar(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Silakan login terlebih dahulu." };
  const userId = session.user.id;

  const file = formData.get("file") as File;
  if (!file) return { error: "Tidak ada file gambar yang dipilih." };

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "kita_id/avatars" },
      async (error, result) => {
        if (error || !result) {
          resolve({ error: "Gagal mengunggah gambar ke Cloudinary." });
        } else {
          try {
            await prisma.user.update({
              where: { id: userId },
              data: { image: result.secure_url },
            });
            revalidatePath("/profile");
            resolve({ success: true, url: result.secure_url });
          } catch(dbErr) {
            resolve({ error: "Gagal menyimpan URL gambar ke database." });
          }
        }
      }
    );
    uploadStream.end(buffer);
  });
}

export async function toggleFollow(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Belum login" };
  const userId = session.user.id;

  if (userId === targetUserId) return { error: "Tidak bisa follow diri sendiri" };

  try {
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId
        }
      }
    });

    if (existingFollow) {
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      });
      revalidatePath(`/profile/${targetUserId}`);
      return { success: true, followed: false };
    } else {
      await prisma.follow.create({
        data: {
          followerId: userId,
          followingId: targetUserId
        }
      });
      
      // Buat notifikasi follow
      await prisma.notification.create({
        data: {
          type: "FOLLOW",
          userId: targetUserId,
          triggerId: userId,
          content: "mulai mengikuti Anda"
        }
      });

      revalidatePath(`/profile/${targetUserId}`);
      return { success: true, followed: true };
    }
  } catch (error: any) {
    return { error: error.message };
  }
}
