import os
import sys
import subprocess

# Menginstal library fpdf2 secara otomatis jika belum terpasang di komputer
try:
    from fpdf import FPDF
except ImportError:
    print("Library 'fpdf2' tidak ditemukan. Menginstal otomatis via pip...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "fpdf2"])
        from fpdf import FPDF
        print("Instalasi berhasil!")
    except Exception as e:
        print(f"Gagal menginstal fpdf2: {e}")
        print("Silakan jalankan secara manual: pip install fpdf2")
        sys.exit(1)

class PDFReport(FPDF):
    def header(self):
        # Header Laporan
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(22, 99, 235) # Warna Biru Utama
        self.cell(0, 10, "LAPORAN DEPLOYMENT SISTEM ABSENSI PKL", border=0, ln=1, align="C")
        
        self.set_font("Helvetica", "I", 10)
        self.set_text_color(100, 116, 139) # Warna Abu-abu
        self.cell(0, 5, "Informasi Lengkap Mengenai Infrastruktur Cloud, Langkah Deploy, dan Batasan Layanan", border=0, ln=1, align="C")
        
        # Garis Pembatas Header
        self.set_draw_color(220, 225, 230)
        self.line(10, 27, 200, 27)
        self.ln(10)

    def footer(self):
        # Footer Halaman
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(156, 163, 175)
        self.cell(0, 10, f"Halaman {self.page_no()} / {{nb}}", border=0, ln=0, align="C")

def create_pdf():
    pdf = PDFReport()
    pdf.alias_nb_pages()
    pdf.add_page()
    
    # --- SECTION 1: PENDAHULUAN DEPLOYMENT ---
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(17, 24, 39)
    pdf.cell(0, 8, "1. Infrastruktur Deployment (Platform)", ln=1)
    
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(55, 65, 81)
    
    infrastruktur_text = (
        "Aplikasi Sistem Absensi PKL berbasis Next.js ini dideploy menggunakan arsitektur cloud serverless "
        "terpisah untuk memisahkan logika aplikasi (Frontend/API) dengan tempat penyimpanan data (Database):\n\n"
        "- Frontend & API Route: Di-host di Vercel (Hobby Free Tier).\n"
        "- Database Engine: Di-host di Supabase (PostgreSQL Free Tier).\n\n"
        "Arsitektur ini dipilih karena memiliki skalabilitas yang sangat tinggi, performa cepat (karena kedua server "
        "diletakkan di Region Singapura yang dekat dengan pengguna Indonesia), serta sepenuhnya gratis untuk kebutuhan "
        "skala kecil, menengah, presentasi, dan akademis."
    )
    pdf.multi_cell(0, 5, infrastruktur_text)
    pdf.ln(5)

    # --- SECTION 2: CARA DEPLOY ---
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(17, 24, 39)
    pdf.cell(0, 8, "2. Langkah-Langkah Deployment ke Vercel", ln=1)
    
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(55, 65, 81)
    
    langkah_text = (
        "Proses deployment menggunakan konsep CI/CD (Continuous Integration / Continuous Deployment) "
        "yang terintegrasi langsung dengan Git dan GitHub. Berikut adalah langkah detailnya:\n\n"
        "1. Push Kode ke GitHub:\n"
        "   Seluruh kode Next.js di-push ke repositori GitHub privat/publik (https://github.com/suzuy1/absensi-pkl.git).\n"
        "   File rahasia kredensial (.env) otomatis diabaikan menggunakan file .gitignore agar database tetap aman.\n\n"
        "2. Hubungkan ke Vercel:\n"
        "   Login ke dashboard Vercel menggunakan akun GitHub, kemudian pilih menu 'Import Project' pada repositori "
        "   'absensi-pkl'. Vercel secara otomatis mengenali konfigurasi Next.js.\n\n"
        "3. Konfigurasi Environment Variables:\n"
        "   Sebelum deploy, masukkan kredensial database di tab 'Environment Variables' pada Vercel:\n"
        "   - DATABASE_URL (Koneksi pooling Supabase untuk runtime aplikasi)\n"
        "   - DIRECT_URL (Koneksi langsung Supabase untuk migrasi skema tabel)\n"
        "   - JWT_SECRET (Kunci enkripsi session cookie pengguna)\n\n"
        "4. Deploy Otomatis:\n"
        "   Klik tombol 'Deploy'. Vercel akan mengunduh dependensi (npm install), mem-build kode Next.js menjadi statis, "
        "   dan memberikan domain aktif (.vercel.app) yang bisa diakses secara online."
    )
    pdf.multi_cell(0, 5, langkah_text)
    pdf.ln(5)

    # --- SECTION 3: DURASI & FREKUENSI ---
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(17, 24, 39)
    pdf.cell(0, 8, "3. Durasi Aktif dan Frekuensi Penggunaan", ln=1)
    
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(55, 65, 81)
    
    durasi_text = (
        "- Masa Aktif (Durasi): Website absensi ini akan aktif online selama 24 jam sehari, 7 hari seminggu, "
        "SELAMANYA (Lifetime Free) tanpa batas waktu kedaluwarsa. Layanan gratis ini tidak akan ditagih biaya "
        "selama penggunaan tidak melewati kuota gratis yang ditentukan.\n\n"
        "- Frekuensi Deployment (Berapa Kali Bisa Digunakan): Tidak terbatas (Unlimited). Karena menggunakan "
        "sistem CI/CD GitHub, setiap kali pengembang memperbarui kode di laptop lokal dan melakukan perintah push "
        "ke GitHub, Vercel akan otomatis mendeteksi perubahan tersebut dan langsung men-deploy ulang kode terbaru "
        "secara langsung di latar belakang tanpa mengganggu jalannya aplikasi yang sedang aktif."
    )
    pdf.multi_cell(0, 5, durasi_text)
    pdf.ln(5)

    # --- SECTION 4: BATASAN LAYANAN ---
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(17, 24, 39)
    pdf.cell(0, 8, "4. Batasan Layanan Gratis (Free Tier Limits)", ln=1)
    
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(55, 65, 81)
    
    batasan_text = (
        "Layanan gratis Vercel dan Supabase memiliki beberapa batasan penggunaan kuota bulanan. Berikut adalah rinciannya:\n\n"
        "A. Batasan Vercel (Hobby Free Tier):\n"
        "- Bandwidth (Data Keluar): 100 GB per bulan. Untuk aplikasi absensi PKL berbasis teks dan lokasi, kuota ini "
        "  sangat besar dan cukup untuk melayani ribuan pengguna aktif setiap harinya.\n"
        "- Durasi Eksekusi API (Serverless Function): Maksimal 10 detik per request API.\n"
        "- Antrean Deploy: 1 proses build dalam satu waktu.\n\n"
        "B. Batasan Supabase (Free Tier):\n"
        "- Ukuran Penyimpanan Database: Maksimal 500 MB. Database PostgreSQL sangat efisien dalam menyimpan teks, "
        "  kapasitas ini cukup untuk menampung ratusan ribu log riwayat absensi siswa.\n"
        "- Bandwidth Database: Maksimal 2 GB per bulan.\n"
        "- Jumlah Project Aktif: Maksimal 2 project gratis dalam 1 akun.\n"
        "- Kebijakan Non-Aktif (Database Sleep): Jika database tidak diakses sama sekali (tidak ada request absen "
        "  atau login) selama 1 minggu berturut-turut, Supabase akan menonaktifkan database secara otomatis untuk "
        "  menghemat resource. Database dapat diaktifkan kembali dengan mudah melalui 1 klik tombol 'Resume' di dashboard."
    )
    pdf.multi_cell(0, 5, batasan_text)
    pdf.ln(5)

    # --- SECTION 5: KESIMPULAN ---
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(17, 24, 39)
    pdf.cell(0, 8, "5. Kesimpulan", ln=1)
    
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(55, 65, 81)
    
    kesimpulan_text = (
        "Deployment Sistem Absensi PKL menggunakan Vercel dan Supabase merupakan solusi terbaik yang efisien. "
        "Sistem ini 100% gratis, aman dari modifikasi pihak luar karena token sesi terenkripsi JWT, dan siap diakses "
        "kapan saja secara langsung di internet tanpa perlu mengaktifkan server lokal di laptop pengembang."
    )
    pdf.multi_cell(0, 5, kesimpulan_text)
    
    # Menyimpan file PDF
    pdf_filename = "Laporan_Deployment_Absensi_PKL.pdf"
    pdf.output(pdf_filename)
    print(f"\nPDF Berhasil Dibuat: {os.path.abspath(pdf_filename)}")

if __name__ == "__main__":
    create_pdf()
