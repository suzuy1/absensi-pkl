import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/auth'

/**
 * 1. POST: Melakukan Absen Masuk atau Absen Pulang (Khusus Anak PKL)
 */
export async function POST(request: Request) {
  try {
    // Membaca session token cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    const user = token ? await decrypt(token) : null

    // Validasi hak akses, hanya anak_pkl yang boleh mengisi absen
    if (!user || user.role !== 'anak_pkl') {
      return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 })
    }

    // Membaca parameter lokasi, koordinat GPS, dan aksi dari JSON Request
    const { lokasi, latitude, longitude, aksi } = await request.json()

    if (!aksi || (aksi !== 'masuk' && aksi !== 'pulang')) {
      return NextResponse.json({ message: 'Aksi tidak valid' }, { status: 400 })
    }

    // Mengambil rentang tanggal hari ini (00:00:00 sampai 23:59:59)
    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    // Mendapatkan String Jam saat ini dalam zona waktu Jakarta (Asia/Jakarta)
    const nowJakarta = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }))
    const hours = String(nowJakarta.getHours()).padStart(2, '0')
    const minutes = String(nowJakarta.getMinutes()).padStart(2, '0')
    const seconds = String(nowJakarta.getSeconds()).padStart(2, '0')
    const jamString = `${hours}:${minutes}:${seconds}` // Format: HH:MM:SS

    // JIKA AKSINYA ABSEN MASUK
    if (aksi === 'masuk') {
      // Cek apakah siswa sudah terdaftar absen masuk hari ini
      const cekAbsen = await prisma.absensi.findFirst({
        where: {
          user_id: user.id,
          tanggal: { gte: startOfDay, lte: endOfDay },
        },
      })

      if (cekAbsen) {
        return NextResponse.json({ message: 'Anda sudah absen masuk hari ini!' }, { status: 400 })
      }

      // Buat log absensi baru di database
      await prisma.absensi.create({
        data: {
          user_id: user.id,
          tanggal: startOfDay,
          jam_hadir: jamString, // Jam masuk terisi otomatis sesuai jam backend
          lokasi: lokasi || 'Lokasi tidak terdeteksi',
          latitude: latitude ? String(latitude) : null,
          longitude: longitude ? String(longitude) : null,
          status: 'Hadir',
        },
      })

      return NextResponse.json({ message: 'Absen Masuk Berhasil!' })
    } 
    // JIKA AKSINYA ABSEN PULANG
    else {
      // Mencari log absen masuk siswa hari ini terlebih dahulu
      const cekAbsen = await prisma.absensi.findFirst({
        where: {
          user_id: user.id,
          tanggal: { gte: startOfDay, lte: endOfDay },
        },
        orderBy: { id: 'desc' },
      })

      // Jika belum pernah absen masuk hari ini
      if (!cekAbsen) {
        return NextResponse.json({ message: 'Anda belum absen masuk hari ini!' }, { status: 400 })
      }

      // Jika sudah pernah absen pulang sebelumnya
      if (cekAbsen.jam_pulang) {
        return NextResponse.json({ message: 'Anda sudah absen pulang hari ini!' }, { status: 400 })
      }

      // Perbarui log absensi hari ini dengan mengisi jam_pulang
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

/**
 * 2. PATCH: Mengedit teks alamat lokasi absensi (Hanya boleh oleh Admin)
 */
export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    const user = token ? await decrypt(token) : null

    // Validasi hak akses admin
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 })
    }

    const { id, lokasi } = await request.json()

    if (!id || !lokasi) {
      return NextResponse.json({ message: 'ID dan Lokasi wajib diisi' }, { status: 400 })
    }

    // Melakukan update alamat lokasi absensi di database
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

/**
 * 3. DELETE: Menghapus data log absensi (Hanya boleh oleh Admin)
 */
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    const user = token ? await decrypt(token) : null

    // Validasi hak akses admin
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 })
    }

    // Menghapus log absensi berdasarkan ID utama
    await prisma.absensi.delete({
      where: { id: Number(id) },
    })

    return NextResponse.json({ message: 'Data absensi berhasil dihapus!' })
  } catch (error: any) {
    console.error('Error deleting attendance:', error)
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 })
  }
}
