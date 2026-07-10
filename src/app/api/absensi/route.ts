import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/auth'

// POST: Absen Masuk & Pulang (Anak PKL)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    const user = token ? await decrypt(token) : null

    if (!user || user.role !== 'anak_pkl') {
      return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 })
    }

    const { lokasi, latitude, longitude, aksi } = await request.json()

    if (!aksi || (aksi !== 'masuk' && aksi !== 'pulang')) {
      return NextResponse.json({ message: 'Aksi tidak valid' }, { status: 400 })
    }

    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    const nowJakarta = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }))
    const hours = String(nowJakarta.getHours()).padStart(2, '0')
    const minutes = String(nowJakarta.getMinutes()).padStart(2, '0')
    const seconds = String(nowJakarta.getSeconds()).padStart(2, '0')
    const jamString = `${hours}:${minutes}:${seconds}`

    if (aksi === 'masuk') {
      const cekAbsen = await prisma.absensi.findFirst({
        where: {
          user_id: user.id,
          tanggal: { gte: startOfDay, lte: endOfDay },
        },
      })

      if (cekAbsen) {
        return NextResponse.json({ message: 'Anda sudah absen masuk hari ini!' }, { status: 400 })
      }

      await prisma.absensi.create({
        data: {
          user_id: user.id,
          tanggal: startOfDay,
          jam_hadir: jamString,
          lokasi: lokasi || 'Lokasi tidak terdeteksi',
          latitude: latitude ? String(latitude) : null,
          longitude: longitude ? String(longitude) : null,
          status: 'Hadir',
        },
      })

      return NextResponse.json({ message: 'Absen Masuk Berhasil!' })
    } else {
      const cekAbsen = await prisma.absensi.findFirst({
        where: {
          user_id: user.id,
          tanggal: { gte: startOfDay, lte: endOfDay },
        },
        orderBy: { id: 'desc' },
      })

      if (!cekAbsen) {
        return NextResponse.json({ message: 'Anda belum absen masuk hari ini!' }, { status: 400 })
      }

      if (cekAbsen.jam_pulang) {
        return NextResponse.json({ message: 'Anda sudah absen pulang hari ini!' }, { status: 400 })
      }

      await prisma.absensi.update({
        where: { id: cekAbsen.id },
        data: {
          jam_pulang: jamString,
        },
      })

      return NextResponse.json({ message: 'Absen Pulang Berhasil!' })
    }
  } catch (error: any) {
    console.error('Error recording attendance:', error)
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 })
  }
}

// PATCH: Edit Lokasi Absen (Admin)
export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    const user = token ? await decrypt(token) : null

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 })
    }

    const { id, lokasi } = await request.json()

    if (!id || !lokasi) {
      return NextResponse.json({ message: 'ID dan Lokasi wajib diisi' }, { status: 400 })
    }

    await prisma.absensi.update({
      where: { id: Number(id) },
      data: { lokasi },
    })

    return NextResponse.json({ message: 'Lokasi berhasil diperbarui!' })
  } catch (error: any) {
    console.error('Error updating location:', error)
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 })
  }
}

// DELETE: Hapus Data Absen (Admin)
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    const user = token ? await decrypt(token) : null

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 })
    }

    await prisma.absensi.delete({
      where: { id: Number(id) },
    })

    return NextResponse.json({ message: 'Data absensi berhasil dihapus!' })
  } catch (error: any) {
    console.error('Error deleting attendance:', error)
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 })
  }
}
