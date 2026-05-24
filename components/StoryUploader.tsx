"use client";

import { useState, useRef } from "react";
import { Plus, Loader2 } from "lucide-react";
import { createStory } from "@/app/actions/story";
import { useRouter } from "next/navigation";

export default function StoryUploader() {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    // You could ask for city, or get it from geolocation. 
    // We'll just hardcode a prompt or use default for now.
    const city = prompt("Lokasi / Kota (opsional)?") || "Lokal";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("city", city);

    try {
      const result: any = await createStory(formData);
      if (result?.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      alert("Terjadi kesalahan saat mengunggah story.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '190px',
          borderRadius: '8px',
          background: 'var(--card-bg, #ffffff)',
          border: '2px dashed var(--line)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: 'var(--primary)',
          cursor: uploading ? 'not-allowed' : 'pointer',
          opacity: uploading ? 0.7 : 1,
          padding: '16px',
          boxShadow: 'var(--shadow)'
        }}
      >
        {uploading ? (
          <Loader2 className="animate-spin" size={28} />
        ) : (
          <div style={{ background: 'var(--surface-soft, #edf8ff)', padding: '12px', borderRadius: '50%' }}>
            <Plus size={24} />
          </div>
        )}
        <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text)' }}>
          {uploading ? "Mengunggah..." : "Buat Story"}
        </span>
      </button>

      <input 
        type="file" 
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }} 
      />
    </div>
  );
}
