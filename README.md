# 📍 Sistem Absensi PKL - Next.js & Supabase

Aplikasi Sistem Absensi Siswa/Mahasiswa PKL modern yang dibuat menggunakan **Next.js (App Router)**, **Prisma ORM**, dan database cloud **Supabase (PostgreSQL)**. Desain antarmuka dibuat secara custom menggunakan **Premium Vanilla CSS** yang responsif, dilengkapi efek glassmorphism, visual widget statistik, dan dark-mode kompatibel.

Aplikasi ini mendeteksi titik koordinat GPS (Latitude & Longitude) siswa secara real-time dan menerjemahkannya menjadi alamat jalan fisik secara otomatis menggunakan API OpenStreetMap (Nominatim).

---

## 🚀 Fitur Utama

1. **Autentikasi Aman:** Menggunakan cookies HTTP-only yang dienkripsi menggunakan JSON Web Token (JWT) secara server-side.
2. **Proteksi Halaman (Middleware):** Pembatasan hak akses halaman dashboard secara otomatis berdasarkan role user.
3. **Dashboard Anak PKL:**
   - Deteksi Geolocation (GPS) otomatis di browser.
   - Reverse Geocoding alamat lokasi secara real-time.
   - Tombol cepat buka koordinat di Google Maps.
   - Sistem validasi kehadiran (absen masuk & pulang hanya bisa dilakukan sekali dalam sehari).
4. **Dashboard Pembimbing:**
   - Ringkasan statistik kehadiran siswa.
   - Rekap daftar absensi siswa (nama, tanggal, jam masuk, jam pulang, alamat, dan link maps).
   - Akses read-only yang aman.
5. **Dashboard Admin:**
   - Ringkasan statistik kehadiran siswa.
   - Rekap daftar absensi siswa (nama, tanggal, jam masuk, jam pulang, alamat, dan link maps).
   - Edit lokasi absensi secara inline dan hapus data absensi.
   - Panel CRUD lengkap Pengelolaan Akun User (Tambah, Edit, Detail, Hapus) menggunakan modal interaktif.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 15 (React 19)
* **Database Client:** Prisma ORM 6
* **Database Engine:** Supabase (PostgreSQL)
* **Styling:** Custom Vanilla CSS (dengan CSS Variables & HSL Colors)
* **Icons:** Lucide React

---

## ⚙️ Persyaratan Sistem

Pastikan perangkat Anda sudah terinstal:
* [Node.js](https://nodejs.org/) (Versi 18 atau yang terbaru)
* NPM (Bawaan Node.js)

---

## 💻 Langkah Menjalankan di Lokal

### 1. Persiapan Projek
Pindahkan atau buka folder projek ini, lalu install semua package yang dibutuhkan:
```bash
npm install
```

### 2. Set Up Environment Variables
Buat akun/project baru di **[Supabase](https://supabase.com)** (gratis). Setelah itu salin URL koneksi database di bagian **Settings** ➔ **Database** ➔ **Connection Strings** (Pilih tab **Prisma**).

Ubah isi file `.env` di root projek menjadi seperti ini:
```env
# URL koneksi database Supabase (Transaction mode / port 6543)
DATABASE_URL="postgresql://postgres.[ID_PROJECT]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# URL koneksi database langsung (Direct mode / port 5432 untuk migrasi/push)
DIRECT_URL="postgresql://postgres.[ID_PROJECT]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# JWT Secret untuk mengenkripsi cookie sesi
JWT_SECRET="bebas_isi_apa_saja_yang_panjang"
```
> *Ganti `[PASSWORD]` dengan password database yang Anda buat saat pertama kali membuat project Supabase.*

### 3. Sinkronisasi Database & Seeding
Jalankan perintah ini untuk membuat tabel otomatis di Supabase dan memasukkan akun demo awal:
```bash
# Sinkronisasi skema tabel ke Supabase
npx prisma db push

# Masukkan data akun default
node prisma/seed.js
```

### 4. Jalankan Aplikasi
Jalankan development server:
```bash
npm run dev
```
Buka browser dan buka alamat: **`http://localhost:3000`**

---

## 🔑 Akun Demo Bawaan

| Nama / Peran | Username | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin` | `admin` |
| **Pembimbing** | `pembimbing` | `pembimbing` |
| **Siswa PKL (Alif)** | `alif` | `alif` |
| **Siswa PKL (Fatir)** | `fatir` | `fatir` |

---

## ☁️ Cara Deploy ke Vercel (Online Selamanya)

Aplikasi Next.js ini dirancang untuk sangat mudah dideploy ke **Vercel** secara gratis:

1. Push projek ini ke repository **GitHub** Anda.
2. Masuk ke **[Vercel](https://vercel.com)** dan buat project baru dengan mengimpor repo GitHub tersebut.
3. Pada halaman konfigurasi Vercel, tambahkan tiga **Environment Variables** berikut:
   - `DATABASE_URL` (Sesuai dengan isi file `.env` Anda)
   - `DIRECT_URL` (Sesuai dengan isi file `.env` Anda)
   - `JWT_SECRET` (Sesuai dengan isi file `.env` Anda)
4. Klik **Deploy**. Selesai! Aplikasi Anda sekarang aktif di internet dan dapat diakses kapan saja dari mana saja.
