import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <main style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', margin: '0 0 8px 0' }}>Profil Saya</h1>
        <p style={{ color: 'var(--muted)', margin: 0 }}>Kelola data diri dan foto profil Anda di sini.</p>
      </div>
      
      <ProfileForm user={user} />
    </main>
  );
}
