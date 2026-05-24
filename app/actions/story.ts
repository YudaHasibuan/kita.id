"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function getStories() {
  try {
    const stories = await prisma.story.findMany({
      where: {
        expiresAt: { gt: new Date() } // Hanya story yang belum expired (kurang dari 24 jam)
      },
      include: {
        author: {
          select: { name: true, image: true, handle: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { stories };
  } catch (error) {
    console.error("Error fetching stories:", error);
    return { stories: [] };
  }
}

export async function createStory(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Silakan login terlebih dahulu." };
  const userId = session.user.id;

  const file = formData.get("file") as File;
  const city = formData.get("city") as string;
  
  if (!file || file.size === 0) return { error: "Tidak ada file gambar yang dipilih." };

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "kita_id/stories" },
      async (error, result) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          resolve({ error: `Gagal mengunggah gambar story ke Cloudinary: ${error?.message || JSON.stringify(error)}` });
        } else {
          try {
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

            await prisma.story.create({
              data: { 
                image: result.secure_url,
                city: city || "Lokal",
                expiresAt,
                authorId: userId
              },
            });
            revalidatePath("/");
            resolve({ success: true });
          } catch(dbErr) {
            console.error("DB Error saving story", dbErr);
            resolve({ error: "Gagal menyimpan story ke database." });
          }
        }
      }
    );
    uploadStream.end(buffer);
  });
}
