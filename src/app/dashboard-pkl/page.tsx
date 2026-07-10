import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/auth'
import AttendanceForm from './AttendanceForm'
import Clock from './Clock'

export default async function DashboardPKLPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const user = token ? await decrypt(token) : null

  if (!user || user.role !== 'anak_pkl') {
    redirect('/login')
  }

  const today = new Date()
  const startOfDay = new Date(today)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)

  // Ambil detail tambahan user dari DB
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { sekolah: true, jurusan: true },
  })

  // Cari absensi hari ini
  const todayAbsen = await prisma.absensi.findFirst({
    where: {
      user_id: user.id,
      tanggal: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { id: 'desc' },
  })

  const initialData = todayAbsen
    ? {
        id: todayAbsen.id,
        jam_hadir: todayAbsen.jam_hadir,
        jam_pulang: todayAbsen.jam_pulang,
        lokasi: todayAbsen.lokasi,
        latitude: todayAbsen.latitude,
        longitude: todayAbsen.longitude,
      }
    : null

  return (
    <div>
      <nav className="navbar">
        <a href="/dashboard-pkl" className="navbar-brand">
          📍 Sistem Absensi PKL
        </a>
        <div className="navbar-user">
          <span className="navbar-username">{user.nama}</span>
          <a href="/api/auth/logout" className="btn btn-danger btn-sm">
            Logout
          </a>
        </div>
      </nav>

      <div className="container">
        <div className="grid grid-main">
          {/* Sisi Kiri: Profil & Status */}
          <div className="flex-column gap-3 d-flex">
            <div className="card shadow">
              <div className="card-header">
                <span>👤 Profil Mahasiswa</span>
              </div>
              <div className="card-body">
                <h3 style={{ fontWeight: '700', marginBottom: '1rem', color: 'hsl(var(--primary))' }}>
                  {user.nama}
                </h3>
                <div className="profile-meta">
                  <div className="profile-meta-item">
                    <span className="profile-label">Sekolah/Instansi</span>
                    <span className="profile-value">{dbUser?.sekolah || '-'}</span>
                  </div>
                  <div className="profile-meta-item">
                    <span className="profile-label">Jurusan</span>
                    <span className="profile-value">{dbUser?.jurusan || '-'}</span>
                  </div>
                  <div className="profile-meta-item">
                    <span className="profile-label">Peran</span>
                    <span className="profile-value">Anak PKL</span>
                  </div>
                </div>

                <hr style={{ margin: '1rem 0', borderColor: 'hsl(var(--border-color))' }} />
                
                <Clock />

                {/* Status Kehadiran Hari Ini */}
                {!todayAbsen ? (
                  <div className="alert alert-danger text-center" style={{ marginTop: '1rem' }}>
                    🔴 Belum Absen Hari Ini
                  </div>
                ) : !todayAbsen.jam_pulang ? (
                  <div className="alert alert-success text-center" style={{ marginTop: '1rem' }}>
                    ✅ Sudah Masuk
                    <br />
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                      Jam Masuk: {todayAbsen.jam_hadir} WIB
                    </span>
                  </div>
                ) : (
                  <div className="alert alert-info text-center" style={{ marginTop: '1rem' }}>
                    🎉 Sudah Pulang
                    <br />
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                      Jam Pulang: {todayAbsen.jam_pulang} WIB
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Form input absen */}
          <div>
            <AttendanceForm initialData={initialData} />
          </div>
        </div>
      </div>

      <footer className="footer">
        © 2026 Sistem Absensi PKL • Migrated to Next.js
      </footer>
    </div>
  )
}
