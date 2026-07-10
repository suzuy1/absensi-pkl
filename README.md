<p align="center">
  <img src="./public/logo.png" alt="Sistem Absensi PKL Logo" width="140" style="border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);" />
</p>

<h1 align="center">📍 Sistem Absensi PKL</h1>

<p align="center">
  Aplikasi manajemen kehadiran siswa/mahasiswa magang PKL berbasis web modern. Dilengkapi dengan deteksi koordinat GPS <strong>Geolocation</strong> secara real-time, penerjemahan alamat jalan fisik melalui <strong>OpenStreetMap Reverse Geocoding API</strong>, serta visualisasi lokasi di <strong>Google Maps</strong>. 
</p>

<p align="center">
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-15.0-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  </a>
  <a href="https://supabase.com/">
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  </a>
  <a href="https://www.prisma.io/">
    <img src="https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  </a>
  <a href="https://vercel.com/">
    <img src="https://img.shields.io/badge/Vercel-Deploy_Ready-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  </a>
</p>

---

## ✨ Fitur Utama Aplikasi

### 👤 Siswa/Anak PKL Portal
* **Deteksi GPS Otomatis:** Otomatis mengambil data koordinat latitude dan longitude perangkat siswa saat membuka aplikasi.
* **Reverse Geocoding:** Menerjemahkan titik koordinat koordinat menjadi alamat lengkap jalan, desa, kecamatan, dan kota secara instan melalui API Nominatim (OpenStreetMap).
* **Validasi Kehadiran:** Sistem mencegah kecurangan. Siswa hanya diizinkan melakukan **Absen Masuk** sekali sehari dan **Absen Pulang** sekali sehari.
* **Integrasi Maps:** Navigasi cepat untuk membuka lokasi koordinat saat ini langsung di Google Maps.

### 👨‍🏫 Pembimbing Portal
* **Statistik Real-time:** Menampilkan total siswa yang hadir, masih di kantor, dan yang sudah pulang hari ini secara dinamis.
* **Portal Monitoring:** Akses khusus *read-only* untuk melihat rekap kehadiran seluruh anak bimbingannya secara langsung beserta titik koordinat dan alamat lengkap mereka.

### 🛠️ Administrator Portal
* **Statistik Dashboard Komprehensif:** Dashboard pemantauan grafik/angka kehadiran harian.
* **Koreksi Data:** Kemampuan mengedit nama lokasi secara langsung di baris tabel (*inline editing*) dan menghapus log absensi bermasalah.
* **CRUD Akun User Modern:** Panel manajemen akun user (tambah, edit password, detail profil, hapus) dalam bentuk modal interaktif yang cepat tanpa refresh halaman.

---

## ⚡ Teknologi yang Digunakan

* **Framework Utama:** [Next.js 15 (App Router)](https://nextjs.org/)
* **Runtime & Library:** React 19, TypeScript
* **Database ORM:** [Prisma ORM 6](https://www.prisma.io/)
* **Database Engine:** [Supabase (PostgreSQL Cloud)](https://supabase.com/)
* **Keamanan Sesi:** Enkripsi JWT (JSON Web Token) via library `jose` disimpan di HTTP-only cookie.
* **Hashing Password:** `bcryptjs` (kompatibel penuh dengan hash default PHP).
* **Desain UI/Aestetika:** **Premium Vanilla CSS** (CSS Variables, native Dark Mode, layout flexbox/grid, efek Glassmorphic, dan micro-animations).

---

## 💻 Cara Menjalankan Secara Lokal

### 1. Kloning & Instalasi
Instal seluruh dependensi projek yang dibutuhkan:
```bash
npm install
```

### 2. Konfigurasi Database (.env)
Buat sebuah file `.env` di root folder projek Next.js Anda (atau edit yang sudah ada) lalu masukkan kredensial Supabase Anda:
```env
# Koneksi pooling untuk client (port 6543)
DATABASE_URL="postgresql://postgres.ydjvzeyjnwrbfwzoaoqj:Mizhuhara_22@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Koneksi langsung untuk migrasi CLI (port 5432)
DIRECT_URL="postgresql://postgres.ydjvzeyjnwrbfwzoaoqj:Mizhuhara_22@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Secret Key enkripsi token sesi
JWT_SECRET="absensi_pkl_jwt_secret_key_12345_random_string_here"
```

### 3. Setup Database & Akun Default
Jalankan perintah berikut di Terminal/CMD untuk mengirimkan struktur tabel dan mengisi akun demo secara otomatis:
```bash
# Push skema tabel ke database cloud Supabase
npx prisma db push

# Masukkan data dummy & akun awal
node prisma/seed.js
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka browser di alamat: **`http://localhost:3000`**

---

## 🔑 Kredensial Akun Default

Gunakan akun di bawah ini untuk menguji berbagai jenis hak akses (role):

| Peran (Role) | Username | Password | Deskripsi Akses |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin` | Kelola akun & seluruh log absensi |
| **Pembimbing** | `pembimbing` | `pembimbing` | Monitor kehadiran rekap siswa |
| **Siswa PKL (Alif)** | `alif` | `alif` | Form absen masuk & pulang |
| **Siswa PKL (Fatir)** | `fatir` | `fatir` | Form absen masuk & pulang |

---

## ☁️ Panduan Deploy ke Vercel (Gratis)

1. Buat repository baru di **GitHub** Anda, lalu hubungkan dan push projek ini:
   ```bash
   git add .
   git commit -m "Migrate to Next.js & Supabase"
   git branch -M main
   git remote add origin [URL_REPO_GITHUB_ANDA]
   git push -u origin main
   ```
2. Buka **[Vercel](https://vercel.com/)** dan import repository GitHub Anda.
3. Di tab **Environment Variables**, masukkan 3 variabel yang ada di file `.env` (`DATABASE_URL`, `DIRECT_URL`, dan `JWT_SECRET`).
4. Klik **Deploy**! Aplikasi Anda kini sudah online dan dapat diakses semua orang dari internet.
