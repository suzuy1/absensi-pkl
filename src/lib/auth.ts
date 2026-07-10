import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

// Mengambil kunci rahasia (Secret Key) dari file .env untuk menandatangani JWT.
// Jika kosong, gunakan default (sebagai fallback keamanan).
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'absensi_pkl_jwt_secret_key_12345_random_string_here'
)

// Struktur data (payload) yang akan dimasukkan ke dalam sesi JWT
export interface UserSession {
  id: number
  nama: string
  role: 'admin' | 'pembimbing' | 'anak_pkl'
}

/**
 * 1. Fungsi untuk mengenkripsi/membuat token sesi baru (JWT)
 * Digunakan saat user berhasil login.
 */
export async function encrypt(payload: UserSession) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' }) // Algoritma tanda tangan token (HMAC menggunakan SHA-256)
    .setIssuedAt() // Waktu pembuatan token
    .setExpirationTime('1d') // Masa aktif token berakhir dalam 1 hari
    .sign(SECRET) // Ditandatangani menggunakan Secret Key rahasia kita
}

/**
 * 2. Fungsi untuk mendekripsi/memverifikasi token sesi (JWT)
 * Digunakan di middleware dan API rute untuk mengecek apakah sesi user masih valid.
 */
export async function decrypt(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      algorithms: ['HS256'],
    })
    // Mengembalikan data payload user jika token sah/valid
    return payload as unknown as UserSession
  } catch (error) {
    // Mengembalikan null jika token kadaluwarsa, palsu, atau rusak
    return null
  }
}

/**
 * 3. Fungsi untuk melakukan hashing password (Bcrypt)
 * Digunakan saat admin menambahkan user baru atau mengubah password.
 */
export async function hashPassword(password: string): Promise<string> {
  // Angka 10 adalah saltRounds (tingkat kompleksitas enkripsi), default standar industri
  return await bcrypt.hash(password, 10)
}

/**
 * 4. Fungsi untuk membandingkan password teks polos dengan password hash di database
 * Digunakan pada saat proses verifikasi login.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}
