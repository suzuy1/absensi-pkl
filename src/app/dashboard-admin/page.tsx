import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/auth'
import AttendanceTable from './AttendanceTable'
import { Users, LogOut } from 'lucide-react'

export default async function DashboardAdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const user = token ? await decrypt(token) : null

  if (!user || user.role !== 'admin') {
    redirect('/login')
  }

  // 1. Ambil Statistik
  const totalAbsensi = await prisma.absensi.count()
  const masihPkl = await prisma.absensi.count({
    where: { jam_pulang: null },
  })
  const sudahPulang = await prisma.absensi.count({
    where: { jam_pulang: { not: null } },
  })

  // 2. Ambil Semua Data Absensi joined dengan User
  const absensiRecords = await prisma.absensi.findMany({
    include: {
      user: {
        select: {
          nama: true,
        },
      },
    },
    orderBy: {
      id: 'desc',
    },
  })

  // Format ke bentuk datar agar mudah dikonsumsi client component
  const records = absensiRecords.map((item) => ({
    id: item.id,
    nama: item.user?.nama || 'Pengguna Tidak Diketahui',
    tanggal: item.tanggal ? item.tanggal.toISOString() : '',
    jam_hadir: item.jam_hadir,
    jam_pulang: item.jam_pulang,
    lokasi: item.lokasi,
    latitude: item.latitude,
    longitude: item.longitude,
  }))

  return (
    <div>
      <nav className="navbar">
        <Link href="/dashboard-admin" className="navbar-brand">
          🛠 Dashboard Admin
        </Link>
        <div className="navbar-user">
          <span className="navbar-username">{user.nama} (Admin)</span>
          <Link href="/admin/users" className="btn btn-primary btn-sm">
            <Users size={16} />
            Kelola Akun
          </Link>
          <a href="/api/auth/logout" className="btn btn-danger btn-sm">
            <LogOut size={16} />
            Logout
          </a>
        </div>
      </nav>

      <div className="container">
        {/* Widgets Statistik */}
        <div className="grid grid-cols-3 mb-4">
          <div className="stat-card success shadow">
            <span className="stat-title">Total Absensi Kehadiran</span>
            <span className="stat-number">{totalAbsensi}</span>
          </div>
          <div className="stat-card warning shadow">
            <span className="stat-title">Siswa Masih PKL (Di Kantor)</span>
            <span className="stat-number">{masihPkl}</span>
          </div>
          <div className="stat-card danger shadow">
            <span className="stat-title">Siswa Sudah Pulang</span>
            <span className="stat-number">{sudahPulang}</span>
          </div>
        </div>

        {/* Tabel Data Absensi */}
        <div className="card shadow">
          <div className="card-header" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #4f46e5 100%)', color: 'white' }}>
            <span>📋 Data Absensi Anak PKL</span>
          </div>
          <div className="card-body">
            <AttendanceTable records={records} />
          </div>
        </div>
      </div>

      <footer className="footer">
        © 2026 Sistem Absensi PKL • Migrated to Next.js
      </footer>
    </div>
  )
}
