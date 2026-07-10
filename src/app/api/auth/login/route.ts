import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { comparePassword, encrypt } from '@/lib/auth'

/**
 * Endpoint API untuk memproses login pengguna (POST /api/auth/login)
 */
export async function POST(request: Request) {
  try {
    // 1. Membaca data kiriman JSON (username & password) dari formulir login
    const { username, password } = await request.json()

    // Validasi input wajib terisi
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username dan Password wajib diisi!' },
        { status: 400 }
      )
    }

    // 2. Mencari data pengguna berdasarkan username unik menggunakan Prisma ORM
    const user = await prisma.user.findUnique({
      where: { username },
    })

    // Jika username tidak terdaftar di database
    if (!user || !user.password) {
      return NextResponse.json(
        { message: 'Username atau Password salah!' },
        { status: 401 }
      )
    }

    // 3. Verifikasi apakah password teks polos cocok dengan hash Bcrypt di database
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Username atau Password salah!' },
        { status: 401 }
      )
    }

    // 4. Jika password cocok, persiapkan data payload untuk sesi pengguna
    const sessionData = {
      id: user.id,
      nama: user.nama || 'User',
      role: user.role as 'admin' | 'pembimbing' | 'anak_pkl',
    }

    // 5. Enkripsi data sesi menjadi token JWT
    const token = await encrypt(sessionData)

    // 6. Buat objek response sukses
    const response = NextResponse.json({
      message: 'Login Berhasil',
      role: user.role,
    })

    // 7. Simpan token JWT ke dalam Cookie browser dengan konfigurasi aman (HTTP-only)
    response.cookies.set({
      name: 'session',
      value: token,
      httpOnly: true, // Mencegah pencurian token via skrip XSS JavaScript di browser
      secure: process.env.NODE_ENV === 'production', // Cookie hanya dikirim via HTTPS jika di tahap produksi
      sameSite: 'lax', // Mencegah serangan pemalsuan permintaan lintas situs (CSRF)
      path: '/',
      maxAge: 60 * 60 * 24, // Masa aktif cookie dibatasi selama 1 hari (dalam satuan detik)
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    )
  }
}
