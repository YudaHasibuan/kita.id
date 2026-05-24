"use client";
import { useState } from "react";
import { updateProfile, uploadAvatar } from "../actions/profile";
import { logoutUser } from "../actions/auth";

export default function ProfileForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const res = await updateProfile(fd);
    if (res.error) setMsg(`Gagal: ${res.error}`);
    else setMsg("Profil berhasil diperbarui!");
    setLoading(false);
  }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    setAvatarLoading(true);
    const fd = new FormData();
    fd.append("file", e.target.files[0]);
    
    // We are casting res here, in reality we'd type it properly
    const res = await uploadAvatar(fd) as { error?: string, success?: boolean, url?: string };
    
    if (res.error) {
      alert(res.error);
    } else {
      // Refresh page to show new image (or just let Server Component handle it on revalidatePath)
      window.location.reload();
    }
    setAvatarLoading(false);
  }

  return (
    <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px' }}>
      
      {/* Bagian Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{ 
          width: '120px', height: '120px', borderRadius: '50%', background: 'var(--line)', 
          overflow: 'hidden', position: 'relative', flexShrink: 0, border: '4px solid white', boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }}>
          {user.image ? (
            <img src={user.image} alt="Avatar" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
          ) : (
            <div style={{width:'100%', height:'100%', display:'grid', placeItems:'center', fontSize:'32px', color:'var(--muted)'}}>
              {user.name?.charAt(0) || 'K'}
            </div>
          )}
          {avatarLoading && <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', display:'grid', placeItems:'center', color:'white', fontSize:'14px', fontWeight:'bold'}}>⏳</div>}
        </div>
        
        <div>
          <label className="auth-button" style={{ cursor: 'pointer', padding: '12px 24px', display: 'inline-block', width: 'auto', marginBottom: '8px' }}>
            {avatarLoading ? 'Mengunggah...' : 'Ubah Foto Profil'}
            <input type="file" accept="image/*" hidden onChange={handleAvatar} disabled={avatarLoading} />
          </label>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>Format: JPG, PNG. Maksimal 5MB.</p>
        </div>
      </div>

      {msg && (
        <div className="auth-alert" style={{ background: msg.includes('Gagal') ? '#fff0f0' : '#e6ffed', color: msg.includes('Gagal') ? '#e53e3e' : '#047857', border: `1px solid ${msg.includes('Gagal') ? '#fed7d7' : '#a7f3d0'}`}}>
          {msg}
        </div>
      )}

      {/* Bagian Form */}
      <form onSubmit={handleUpdate} className="auth-form">
        <div className="input-group">
          <label>Nama Lengkap</label>
          <input type="text" name="name" defaultValue={user.name || ""} required placeholder="Misal: Budi Santoso" />
        </div>
        
        <div className="input-group">
          <label>Username / Handle</label>
          <input type="text" name="handle" defaultValue={user.handle || ""} required placeholder="@budi" />
        </div>
        
        <div className="input-group">
          <label>Bio Singkat</label>
          <input type="text" name="bio" defaultValue={user.bio || ""} placeholder="Tulis sesuatu yang menarik tentang dirimu..." />
        </div>
        
        <button type="submit" className="auth-button" disabled={loading} style={{ marginTop: '16px' }}>
          {loading ? "Menyimpan Perubahan..." : "Simpan Perubahan Profil"}
        </button>
      </form>

      {/* Tombol Logout */}
      <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--line)' }}>
        <button 
          onClick={async () => await logoutUser()}
          className="auth-button" 
          style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}
        >
          Keluar (Logout)
        </button>
      </div>
    </div>
  );
}
