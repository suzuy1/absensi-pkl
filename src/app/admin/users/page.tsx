import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/auth'
import UserManager from './UserManager'
import { LogOut } from 'lucide-react'

export default async function AdminUsersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const userSession = token ? await decrypt(token) : null

  if (!userSession || userSession.role !== 'admin') {
    redirect('/login')
  }

  // Ambil semua user dari DB
  const dbUsers = await prisma.user.findMany({
    orderBy: { id: 'desc' },
  })

  // Serialisasi data agar aman dikirim ke Client Component (karena objek Date tidak bisa langsung dikirim)
  const users = dbUsers.map((item) => ({
    id: item.id,
    nama: item.nama,
    username: item.username,
    role: item.role as 'admin' | 'pembimbing' | 'anak_pkl',
    sekolah: item.sekolah,
    jurusan: item.jurusan,
    tgl_mulai: item.tgl_mulai ? item.tgl_mulai.toISOString() : null,
    tgl_selesai: item.tgl_selesai ? item.tgl_selesai.toISOString() : null,
  }))

  return (
    <div>
      <nav className="navbar">
        <Link href="/dashboard-admin" className="navbar-brand">
          🛠 Panel Admin
        </Link>
        <div className="navbar-user">
          <span className="navbar-username">{userSession.nama} (Admin)</span>
          <a href="/api/auth/logout" className="btn btn-danger btn-sm">
            <LogOut size={16} />
            Logout
          </a>
        </div>
      </nav>

      <div className="container">
        <UserManager users={users} currentUserSessionId={userSession.id} />
      </div>

      <footer className="footer">
        © 2026 Sistem Absensi PKL • Migrated to Next.js
      </footer>
    </div>
  )
}
