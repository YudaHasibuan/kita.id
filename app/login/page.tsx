"use client";

import { useState } from "react";
import { loginUser, googleSignIn } from "../actions/auth";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Github } from "lucide-react";

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
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden text-white font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[150px] pointer-events-none" />
      
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

      <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Card Container */}
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 p-10 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 mb-6 shadow-lg shadow-blue-500/30">
              <span className="text-3xl font-extrabold text-white tracking-tighter">K.</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Selamat Datang</h1>
            <p className="text-white/50 text-sm">Masuk untuk terhubung dengan komunitas.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-in shake">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-medium text-white/60 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-blue-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  placeholder="nama@email.com" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-medium text-white/60 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-blue-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full mt-6 bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Masuk ke Akun</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 mb-6 flex items-center justify-center gap-4">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-white/30 text-xs font-medium uppercase tracking-wider">Atau lanjutkan dengan</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <form action={googleSignIn}>
            <button 
              type="submit" 
              className="w-full bg-[#1A1A1A] border border-white/5 hover:border-white/20 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-[#222] active:scale-[0.98]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Google</span>
            </button>
          </form>

        </div>

        <p className="text-center mt-8 text-white/50 text-sm">
          Belum punya akun?{' '}
          <Link href="/register" className="text-white hover:text-blue-400 font-medium transition-colors border-b border-transparent hover:border-blue-400 pb-0.5">
            Buat akun baru
          </Link>
        </p>
      </div>
    </main>
  );
}
