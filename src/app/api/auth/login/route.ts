import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { comparePassword, encrypt } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username dan Password wajib diisi!' },
        { status: 400 }
      )
    }

    // Cari user di database
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { message: 'Username atau Password salah!' },
        { status: 401 }
      )
    }

    // Verifikasi password (bcrypt)
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Username atau Password salah!' },
        { status: 401 }
      )
    }

    // Buat session payload
    const sessionData = {
      id: user.id,
      nama: user.nama || 'User',
      role: user.role as 'admin' | 'pembimbing' | 'anak_pkl',
    }

    // Enkripsi token session
    const token = await encrypt(sessionData)

    // Set cookie HTTP-only
    const response = NextResponse.json({
      message: 'Login Berhasil',
      role: user.role,
    })

    response.cookies.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 hari
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
