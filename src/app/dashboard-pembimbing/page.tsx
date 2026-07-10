import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/auth'
import { LogOut, Navigation } from 'lucide-react'

export default async function DashboardPembimbingPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const user = token ? await decrypt(token) : null

  if (!user || user.role !== 'pembimbing') {
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
  const records = await prisma.absensi.findMany({
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

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div>
      <nav className="navbar">
        <Link href="/dashboard-pembimbing" className="navbar-brand">
          👨‍🏫 Dashboard Pembimbing
        </Link>
        <div className="navbar-user">
          <span className="navbar-username">{user.nama} (Pembimbing)</span>
          <a href="/api/auth/logout" className="btn btn-danger btn-sm">
            <LogOut size={16} />
            Logout
          </a>
        </div>
      </nav>

      <div className="container">
        {/* Widgets Statistik */}
        <div className="grid grid-cols-3 mb-4">
          <div className="stat-card primary shadow">
            <span className="stat-title">Total Kehadiran Siswa</span>
            <span className="stat-number">{totalAbsensi}</span>
          </div>
          <div className="stat-card warning shadow">
            <span className="stat-title">Siswa di Kantor (Masih PKL)</span>
            <span className="stat-number">{masihPkl}</span>
          </div>
          <div className="stat-card danger shadow">
            <span className="stat-title">Siswa Sudah Pulang</span>
            <span className="stat-number">{sudahPulang}</span>
          </div>
        </div>

        {/* Tabel Data Kehadiran */}
        <div className="card shadow">
          <div className="card-header" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #4f46e5 100%)', color: 'white' }}>
            <span>📋 Rekap Kehadiran Anak PKL</span>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>No</th>
                    <th>Nama Siswa</th>
                    <th>Tanggal</th>
                    <th>Jam Masuk</th>
                    <th>Jam Pulang</th>
                    <th>Status</th>
                    <th>Lokasi Absensi</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Maps</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="table-no-data">
                        Belum ada rekam kehadiran hari ini.
                      </td>
                    </tr>
                  ) : (
                    records.map((row, index) => (
                      <tr key={row.id}>
                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                        <td>
                          <strong>{row.user?.nama || 'Pengguna Tidak Diketahui'}</strong>
                        </td>
                        <td>{formatDate(row.tanggal)}</td>
                        <td>
                          <span className="badge badge-success">{row.jam_hadir} WIB</span>
                        </td>
                        <td>
                          {row.jam_pulang ? (
                            <span className="badge badge-danger">{row.jam_pulang} WIB</span>
                          ) : (
                            <span className="badge badge-secondary">Belum Pulang</span>
                          )}
                        </td>
                        <td>
                          {row.jam_pulang ? (
                            <span className="badge badge-info">Sudah Pulang</span>
                          ) : (
                            <span className="badge badge-warning">Masih PKL</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.9rem', maxWidth: '350px', whiteSpace: 'normal', lineHeight: '1.4' }}>
                          {row.lokasi || 'Lokasi tidak terdeteksi'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {row.latitude && row.longitude ? (
                            <a
                              href={`https://www.google.com/maps?q=${row.latitude},${row.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary btn-sm"
                              title="Buka Google Maps"
                            >
                              <Navigation size={14} />
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        © 2026 Sistem Absensi PKL • Migrated to Next.js
      </footer>
    </div>
  )
}
