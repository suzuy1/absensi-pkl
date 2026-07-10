import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { decrypt, hashPassword } from '@/lib/auth'

// GET: List all users
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    const user = token ? await decrypt(token) : null

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      orderBy: { id: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// POST: Tambah User baru
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    const userSession = token ? await decrypt(token) : null

    if (!userSession || userSession.role !== 'admin') {
      return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 })
    }

    const data = await request.json()
    const { nama, username, password, role, sekolah, jurusan, tgl_mulai, tgl_selesai } = data

    if (!nama || !username || !password || !role) {
      return NextResponse.json({ message: 'Nama, Username, Password, dan Role wajib diisi' }, { status: 400 })
    }

    // Cek username unik
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Username sudah digunakan!' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    const newUser = await prisma.user.create({
      data: {
        nama,
        username,
        password: hashedPassword,
        role,
        sekolah: role === 'anak_pkl' ? sekolah : null,
        jurusan: role === 'anak_pkl' ? jurusan : null,
        tgl_mulai: role === 'anak_pkl' && tgl_mulai ? new Date(tgl_mulai) : null,
        tgl_selesai: role === 'anak_pkl' && tgl_selesai ? new Date(tgl_selesai) : null,
      },
    })

    return NextResponse.json({ message: 'User berhasil ditambahkan!', user: newUser })
  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// PATCH: Edit/Update User
export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    const userSession = token ? await decrypt(token) : null

    if (!userSession || userSession.role !== 'admin') {
      return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 })
    }

    const data = await request.json()
    const { id, nama, username, password, role, sekolah, jurusan, tgl_mulai, tgl_selesai } = data

    if (!id || !nama || !username || !role) {
      return NextResponse.json({ message: 'ID, Nama, Username, dan Role wajib diisi' }, { status: 400 })
    }

    const userId = Number(id)

    // Cek username unik (kecuali milik sendiri)
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        NOT: { id: userId },
      },
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Username sudah digunakan oleh akun lain!' }, { status: 400 })
    }

    // Siapkan data update
    const updateData: any = {
      nama,
      username,
      role,
      sekolah: role === 'anak_pkl' ? sekolah : null,
      jurusan: role === 'anak_pkl' ? jurusan : null,
      tgl_mulai: role === 'anak_pkl' && tgl_mulai ? new Date(tgl_mulai) : null,
      tgl_selesai: role === 'anak_pkl' && tgl_selesai ? new Date(tgl_selesai) : null,
    }

    // Jika password diubah
    if (password && password.trim() !== '') {
      updateData.password = await hashPassword(password)
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return NextResponse.json({ message: 'User berhasil diperbarui!' })
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// DELETE: Hapus User
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    const userSession = token ? await decrypt(token) : null

    if (!userSession || userSession.role !== 'admin') {
      return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 })
    }

    const userId = Number(id)

    // Cegah admin menghapus dirinya sendiri
    if (userId === userSession.id) {
      return NextResponse.json({ message: 'Anda tidak dapat menghapus akun Anda sendiri!' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ message: 'User berhasil dihapus!' })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
