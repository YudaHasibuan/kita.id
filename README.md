<div align="center">
  <h1>🌟 KITA.ID</h1>
  <p><b>Platform Media Sosial Modern dengan Desain Premium & Kinerja Tinggi</b></p>
</div>

<br />

KITA.ID adalah aplikasi jejaring sosial *full-stack* yang dibangun menggunakan teknologi web modern terkini. Proyek ini berfokus pada pengalaman pengguna yang dinamis, interaktif, dan sangat estetik dengan antarmuka bergaya *premium glassmorphism*.

## 🚀 Fitur Utama

- 🔐 **Autentikasi Aman:** Sistem registrasi & login tangguh menggunakan kredensial email/password dan integrasi OAuth (bertenaga **NextAuth v5**).
- 🖼️ **Profil & Media Dinamis:** Manajemen profil pengguna lengkap dengan pengunggahan avatar *real-time* yang teroptimasi (didukung oleh **Cloudinary**).
- 📰 **Feed Interaktif (Tahap Pengembangan):** Linimasa dinamis untuk membagikan teks, foto, dan cerita keseharian Anda.
- 💬 **Komunitas & Chat (Tahap Pengembangan):** Ruang interaksi *real-time* antar pengguna melalui sistem grup dan perpesanan langsung (menggunakan Supabase Realtime).
- 📊 **Live Roadmap Tracking:** Kemajuan pengerjaan fitur di dalam proyek ini disinkronkan secara otomatis secara *real-time* menggunakan Notion API!

## 🛠️ Stack Teknologi (100% Free-Tier Architecture)

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** Custom CSS (Modern Glassmorphism Aesthetic)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Autentikasi:** [Auth.js](https://authjs.dev/) (NextAuth v5)
- **Penyimpanan Media:** [Cloudinary](https://cloudinary.com/)
- **Hosting / Deploy:** [Vercel](https://vercel.com/)

---

## 💻 Cara Menjalankan Secara Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan *source code* KITA.ID di komputer Anda:

### 1. Kloning Repository
```bash
git clone https://github.com/YudaHasibuan/kita.id.git
cd kita.id
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Buat file `.env` di direktori utama (root) proyek ini dan salin struktur berikut. Isi valuenya dengan kredensial dari layanan terkait Anda:

```env
# URL Koneksi Database Supabase Anda (Gunakan port connection pooler jika ada)
DATABASE_URL="postgresql://user:password@host:port/dbname"

# Generate acak dengan perintah: openssl rand -base64 32
NEXTAUTH_SECRET="secret_anda_disini"
NEXTAUTH_URL="http://localhost:3000"

# Kredensial Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="cloud_name_anda"
CLOUDINARY_API_KEY="api_key_anda"
CLOUDINARY_API_SECRET="api_secret_anda"
```

### 4. Persiapkan Skema Database
Sinkronisasikan struktur database lokal (Prisma) Anda ke Supabase:
```bash
npx prisma db push
```

### 5. Jalankan Aplikasi
Jalankan *development server*:
```bash
npm run dev
```
Aplikasi kini dapat diakses melalui [http://localhost:3000](http://localhost:3000) di browser Anda!

---

## 🤝 Kontribusi

Proyek ini merupakan proyek pengembangan berkelanjutan. Jika Anda menemukan *bug* atau ingin menambahkan fitur baru, jangan ragu untuk membuat *Pull Request* atau *Issue*!

Dibuat dengan ❤️ di Indonesia.
