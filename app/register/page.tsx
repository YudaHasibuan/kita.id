"use client";

import { useState } from "react";
import { registerUser } from "../actions/auth";
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const res = await registerUser(formData);
      if (res?.error) setError(res.error);
    } catch (err) {
      // Ignore redirect throws
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-layout">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="brand-mark-large">K</div>
          <h1>Buat Akun Baru</h1>
          <p>Bergabung dan bagikan ceritamu dengan komunitas.</p>
        </div>

        {error && <div className="auth-alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="name">Nama Lengkap</label>
            <input type="text" id="name" name="name" placeholder="Misal: Dimas Arya" required />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" placeholder="nama@email.com" required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Minimal 6 karakter" required minLength={6} />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="auth-footer">
          Sudah punya akun? <Link href="/login">Masuk di sini</Link>
        </p>
      </div>
    </main>
  );
}
