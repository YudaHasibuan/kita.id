import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/lib/auth";
import RealtimeNotification from "@/components/RealtimeNotification";

export const metadata: Metadata = {
  title: "KITA.ID",
  description: "Cerita Kita, Suara Kita."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="id">
      <body>
        {children}
        {session?.user?.id && <RealtimeNotification userId={session.user.id} />}
      </body>
    </html>
  );
}
