# 🚀 KITA.ID - Full Patch Feature Plan & Roadmap
> Cross-check: Semua teknologi yang dipilih adalah **GRATIS 100%** (Free Tier / Open Source).

---

## 🧰 Stack Teknologi (Free Only)

| Kategori | Tool yang Dipilih | Status |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | ✅ GRATIS |
| **Database** | Supabase (PostgreSQL) | ✅ GRATIS (Free Tier) |
| **ORM** | Prisma ORM | ✅ GRATIS (Open Source) |
| **Autentikasi** | Auth.js v5 (NextAuth) | ✅ GRATIS (Open Source) |
| **OAuth Provider** | Google OAuth | ✅ GRATIS |
| **File/Gambar Upload** | Cloudinary | ✅ GRATIS (25GB Free Tier) |
| **Real-time / Chat** | Supabase Realtime | ✅ GRATIS (bawaan Supabase) |
| **Notifikasi Push** | Custom DB Polling | ✅ GRATIS (tanpa service pihak ketiga) |
| **Deploy** | Vercel | ✅ GRATIS (Hobby Plan) |

> ⚠️ **DICORET karena BERBAYAR:** ~~AWS S3~~, ~~Pusher Pro~~, ~~PlanetScale~~ (sudah hapus free tier).

---

## 1. 🔐 Autentikasi & Manajemen Pengguna
> 🛠 Tool: **Auth.js (NextAuth v5)** + **Supabase DB** — GRATIS ✅

- [x] **Registrasi & Login Email/Password** — Auth.js Credentials Provider
- [x] **Login via Google** — Google OAuth 2.0 (gratis, daftar di Google Cloud Console)
- [x] **Manajemen Sesi** — Proteksi rute dengan `middleware.ts` Next.js
- [x] **Halaman Profil Dinamis** — Tampilkan data user dari database
- [x] **Edit Profil** — Form update nama, handle, bio, dan avatar
- [x] **Upload Foto Profil** — Integrasi **Cloudinary** (free tier 25GB)

---

## 2. 📝 Sistem Postingan & Feed (Timeline)
> 🛠 Tool: **Supabase DB** + **Cloudinary** — GRATIS ✅

- [x] **Buat Postingan (Composer)** — Input teks + upload gambar via **Cloudinary** (bukan AWS S3)
- [ ] **Interaksi Like** — Sistem toggle like, simpan ke tabel `likes` di Supabase
- [ ] **Interaksi Komentar** — Nested comment system, simpan ke tabel `comments`
- [ ] **Interaksi Repost** — Share/repost postingan ke feed sendiri
- [ ] **Feed Dinamis** — Hapus mock `data.ts`, ganti dengan Server Action ambil dari Supabase
- [ ] **Filter Feed:** Tab Untuk Kamu / Following / Komunitas / Terdekat
- [ ] **Infinite Scroll** — Load more posts dengan cursor-based pagination

---

## 3. 👥 Sistem Komunitas
> 🛠 Tool: **Supabase DB** — GRATIS ✅

- [ ] **Eksplorasi Komunitas** — List komunitas dari database + jumlah anggota real-time
- [ ] **Join / Leave Komunitas** — Tombol join fungsional, simpan ke tabel `community_members`
- [ ] **Halaman Detail Komunitas** — Feed postingan khusus komunitas
- [ ] **Buat Komunitas Baru** — Form buat komunitas (nama, deskripsi, public/private)

---

## 4. 💬 Chat & Real-Time Messaging
> 🛠 Tool: **Supabase Realtime** (GRATIS, bawaan Supabase) — ~~Pusher~~ ❌ TIDAK DIPAKAI

- [x] **Inbox Chat** — Daftar percakapan terakhir + badge jumlah pesan belum dibaca
- [x] **Direct Message (DM)** — Fitur chat 1 on 1 antar pengguna
- [x] **Real-Time Pesan** — Menggunakan **Supabase Realtime Channels** (WebSocket bawaan, GRATIS)
- [x] **Indikator Online** — Tampilkan status "online" pengguna via Supabase Presence

---

## 5. 📅 Event & Meetup
> 🛠 Tool: **Supabase DB** — GRATIS ✅

- [ ] **Listing Event** — Tampilkan event dari database (judul, tanggal, lokasi, thumbnail)
- [ ] **Sistem RSVP** — Tombol konfirmasi kehadiran, simpan ke tabel `event_rsvp`
- [ ] **Buat Event Baru** — Form tambah event (nama, waktu, lokasi, kapasitas)

---

## 6. 📖 Sistem Story (Cerita 24 Jam)
> 🛠 Tool: **Supabase DB** + **Cloudinary** — GRATIS ✅

- [ ] **Unggah Story** — Upload gambar story via Cloudinary, simpan URL + timestamp ke DB
- [ ] **Story Viewer** — Modal fullscreen interaktif untuk melihat story
- [ ] **Auto Expire 24 Jam** — Filter di query Supabase: hanya tampilkan story `created_at` < 24 jam

---

## 7. 🔍 Pencarian & Trending
> 🛠 Tool: **Supabase DB full-text search** (GRATIS, built-in PostgreSQL) — GRATIS ✅

- [ ] **Global Search** — Cari user, komunitas, event menggunakan PostgreSQL `ILIKE` / `tsvector`
- [ ] **Trending Lokal** — Hitung hashtag terpopuler dari tabel posts dalam 24 jam terakhir

---

## 8. 🔔 Sistem Notifikasi
> 🛠 Tool: **Supabase DB** + **Supabase Realtime** — GRATIS ✅

- [ ] **Notifikasi Aktivitas** — Simpan notif (like, komentar, follow) ke tabel `notifications`
- [ ] **Badge Lonceng** — Tampilkan jumlah notifikasi yang belum dibaca di ikon Bell
- [ ] **Real-time Toast** — Gunakan Supabase Realtime untuk memunculkan pop-up saat ada notif baru

---

## 9. 🛠️ Infrastruktur & Backend Database
> 🛠 Tool: **Supabase + Prisma + Vercel** — GRATIS ✅

- [x] **Setup Supabase Project** — Buat project baru di supabase.com (gratis, tanpa kartu kredit)
- [x] **Skema Database Prisma** — Define model: `User`, `Post`, `Comment`, `Like`, `Community`, `Event`, `Story`, `Message`, `Notification`
- [x] **Prisma Migrate** — Jalankan migrasi database otomatis
- [x] **Server Actions Next.js** — Semua operasi CRUD menggunakan Server Actions (App Router)
- [x] **Setup Cloudinary** — Buat akun di [cloudinary.com](https://cloudinary.com) (free tier 25GB, tanpa kartu kredit)
- [x] **Deploy ke Vercel** — Push ke GitHub → auto-deploy via Vercel (Hobby Plan, GRATIS)

---

## ✅ Ringkasan Biaya

| Layanan | Harga | Batas Free |
|---|---|---|
| Supabase | **$0 / bulan** | 500MB DB, 2GB Storage, 50k MAU |
| Prisma | **$0** | Open Source selamanya |
| Auth.js | **$0** | Open Source selamanya |
| Cloudinary | **$0 / bulan** | 25GB Storage + 25GB Bandwidth |
| Vercel | **$0 / bulan** | 100GB Bandwidth, unlimited projects |
| Google OAuth | **$0** | Gratis tanpa limit |
| **TOTAL** | **🎉 $0 / bulan** | — |

---

📝 *Centang `[x]` saat fitur sudah selesai diimplementasikan.*
