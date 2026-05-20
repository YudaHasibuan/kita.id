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
  
  if (!content || content.trim().length === 0) {
    return { error: "Konten postingan tidak boleh kosong." };
  }

  try {
    await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: session.user.id,
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
