"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Bell } from "lucide-react";
import Link from "next/link";

export default function RealtimeNotification({ userId }: { userId: string }) {
  const [toast, setToast] = useState<{ id: string; content: string } | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Berlangganan (subscribe) ke tabel 'Notification' untuk baris milik userId ini
    const channel = supabase
      .channel("realtime_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Notification",
          filter: `userId=eq.${userId}`
        },
        (payload) => {
          const newNotif = payload.new;
          setToast({ id: newNotif.id, content: newNotif.content || "Anda mendapat notifikasi baru" });

          // Hilangkan toast setelah 5 detik
          setTimeout(() => {
            setToast(null);
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (!toast) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: 'var(--card-bg, white)',
      border: '1px solid var(--line, #e2e8f0)',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '50%' }}>
        <Bell size={20} />
      </div>
      <div>
        <strong style={{ display: 'block', fontSize: '14px', marginBottom: '2px' }}>Notifikasi Baru</strong>
        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Seseorang {toast.content}</span>
      </div>
      <Link href="/notifikasi" onClick={() => setToast(null)} style={{
        marginLeft: '12px',
        padding: '6px 12px',
        background: 'rgba(16, 167, 233, 0.1)',
        color: 'var(--primary)',
        borderRadius: '20px',
        textDecoration: 'none',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        Lihat
      </Link>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}
