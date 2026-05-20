"use client";

import { useState } from "react";
import { loginUser } from "../actions/auth";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginUser(formData);
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
          <h1>Selamat Datang Kembali</h1>
          <p>Masuk untuk terhubung dengan komunitasmu.</p>
        </div>

        {error && <div className="auth-alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" placeholder="nama@email.com" required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" placeholder="••••••••" required />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="auth-footer">
          Belum punya akun? <Link href="/register">Daftar sekarang</Link>
        </p>
      </div>
    </main>
  );
}
