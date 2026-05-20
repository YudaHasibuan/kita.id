"use server";

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Semua field harus diisi." };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email sudah terdaftar. Silakan login." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const handle = `@${name.toLowerCase().replace(/\s+/g, "")}${Math.floor(Math.random() * 1000)}`;

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        handle,
      },
    });
  } catch (error) {
    return { error: "Gagal membuat akun. Coba lagi." };
  }

  redirect("/login?success=Akun berhasil dibuat. Silakan login.");
}

export async function loginUser(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/", // redirect to home after login
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email atau password yang Anda masukkan salah." };
        default:
          return { error: "Terjadi kesalahan saat login." };
      }
    }
    // Required to allow Next.js redirect to happen
    throw error;
  }
}
