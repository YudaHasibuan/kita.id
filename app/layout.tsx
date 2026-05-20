import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KITA.ID",
  description: "Cerita Kita, Suara Kita."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
