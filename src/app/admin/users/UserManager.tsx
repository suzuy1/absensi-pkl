'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus, Eye, Pencil, Trash2, X, Save, Loader2 } from 'lucide-react'

interface UserRecord {
  id: number
  nama: string | null
  username: string | null
  role: 'admin' | 'pembimbing' | 'anak_pkl' | null
  sekolah: string | null
  jurusan: string | null
  tgl_mulai: string | null
  tgl_selesai: string | null
}

interface UserManagerProps {
  users: UserRecord[]
  currentUserSessionId: number
}

export default function UserManager({ users: initialUsers, currentUserSessionId }: UserManagerProps) {
  const [users, setUsers] = useState(initialUsers)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState<'add' | 'edit' | 'view' | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const router = useRouter()

  // Form states
  const [nama, setNama] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'pembimbing' | 'anak_pkl'>('anak_pkl')
  const [sekolah, setSekolah] = useState('')
  const [jurusan, setJurusan] = useState('')
  const [tglMulai, setTglMulai] = useState('')
  const [tglSelesai, setTglSelesai] = useState('')

  const openAddModal = () => {
    setNama('')
    setUsername('')
    setPassword('')
    setRole('anak_pkl')
    setSekolah('')
    setJurusan('')
    setTglMulai('')
    setTglSelesai('')
    setShowModal('add')
  }

  const openEditModal = (user: UserRecord) => {
    setSelectedUser(user)
    setNama(user.nama || '')
    setUsername(user.username || '')
    setPassword('') 
    setRole(user.role || 'anak_pkl')
    setSekolah(user.sekolah || '')
    setJurusan(user.jurusan || '')
    setTglMulai(user.tgl_mulai ? new Date(user.tgl_mulai).toISOString().split('T')[0] : '')
    setTglSelesai(user.tgl_selesai ? new Date(user.tgl_selesai).toISOString().split('T')[0] : '')
    setShowModal('edit')
  }

  const openViewModal = (user: UserRecord) => {
    setSelectedUser(user)
    setShowModal('view')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload: any = {
      nama,
      username,
      role,
      sekolah: role === 'anak_pkl' ? sekolah : null,
      jurusan: role === 'anak_pkl' ? jurusan : null,
      tgl_mulai: role === 'anak_pkl' && tglMulai ? tglMulai : null,
      tgl_selesai: role === 'anak_pkl' && tglSelesai ? tglSelesai : null,
    }

    if (showModal === 'add') {
      payload.password = password
    } else if (showModal === 'edit' && selectedUser) {
      payload.id = selectedUser.id
      if (password.trim() !== '') {
        payload.password = password
      }
    }

    try {
      const url = '/api/admin/users'
      const method = showModal === 'add' ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Terjadi kesalahan')
      }

      alert(data.message)
      setShowModal(null)
      router.refresh()
      
      if (showModal === 'add') {
        window.location.reload()
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser?.id
              ? {
                  ...u,
                  nama,
                  username,
                  role,
                  sekolah: role === 'anak_pkl' ? sekolah : null,
                  jurusan: role === 'anak_pkl' ? jurusan : null,
                  tgl_mulai: role === 'anak_pkl' && tglMulai ? tglMulai : null,
                  tgl_selesai: role === 'anak_pkl' && tglSelesai ? tglSelesai : null,
                }
              : u
          )
        )
      }
    } catch (error: any) {
      alert(error.message || 'Gagal menyimpan user')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (id === currentUserSessionId) {
      alert('Anda tidak dapat menghapus akun Anda sendiri!')
      return
    }

    if (!confirm('Yakin ingin menghapus akun user ini? Semua riwayat absen user ini juga akan terhapus.')) return

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Gagal menghapus user')
      }

      setUsers((prev) => prev.filter((u) => u.id !== id))
      alert(data.message)
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Gagal menghapus user')
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch (e) {
      return dateStr
    }
  }

  return (
    <div className="card shadow">
      <div className="card-header" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #4f46e5 100%)', color: 'white' }}>
        <span>👤 Kelola Akun User</span>
      </div>
      <div className="card-body">
        <div className="d-flex justify-between align-center mb-4">
          <Link href="/dashboard-admin" className="btn btn-secondary">
            <ArrowLeft size={16} />
            Kembali
          </Link>
          <button onClick={openAddModal} className="btn btn-success">
            <UserPlus size={18} />
            Tambah Akun
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>No</th>
                <th>Nama</th>
                <th>Username</th>
                <th>Role</th>
                <th style={{ width: '220px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-no-data">
                    Belum ada data user.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id}>
                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                    <td>
                      <strong>{user.nama}</strong>
                    </td>
                    <td>{user.username}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === 'admin'
                            ? 'badge-danger'
                            : user.role === 'pembimbing'
                            ? 'badge-info'
                            : 'badge-success'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="d-flex gap-2 justify-center" style={{ justifyContent: 'center' }}>
                        <button onClick={() => openViewModal(user)} className="btn btn-secondary btn-sm" title="View Detail">
                          <Eye size={14} />
                          Detail
                        </button>
                        <button onClick={() => openEditModal(user)} className="btn btn-warning btn-sm" title="Edit Akun">
                          <Pencil size={14} />
                          Edit
                        </button>
                        {user.id !== currentUserSessionId ? (
                          <button onClick={() => handleDelete(user.id)} className="btn btn-danger btn-sm" title="Hapus Akun">
                            <Trash2 size={14} />
                            Hapus
                          </button>
                        ) : (
                          <button className="btn btn-secondary btn-sm" disabled title="Akun Anda Sendiri">
                            <Trash2 size={14} />
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ADD / EDIT */}
      {(showModal === 'add' || showModal === 'edit') && (
        <div className="overlay">
          <div className="modal-content">
            <div className="card-header d-flex justify-between align-center" style={{ borderBottom: '1px solid hsl(var(--border-color))' }}>
              <span style={{ fontWeight: 'bold' }}>
                {showModal === 'add' ? '✨ Tambah Akun Baru' : '✏️ Edit Akun'}
              </span>
              <button
                onClick={() => setShowModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="card-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Masukkan Nama Lengkap"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Masukkan Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Password {showModal === 'edit' && <span style={{ color: 'hsl(var(--text-muted))', fontWeight: 'normal' }}>(Kosongkan jika tidak ingin diubah)</span>}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder={showModal === 'add' ? 'Masukkan Password' : 'Sandi Baru'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={showModal === 'add'}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Peran / Role</label>
                  <select
                    className="form-control"
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="admin">Admin</option>
                    <option value="pembimbing">Pembimbing</option>
                    <option value="anak_pkl">Anak PKL</option>
                  </select>
                </div>

                {role === 'anak_pkl' && (
                  <>
                    <hr style={{ margin: '1.5rem 0', borderColor: 'hsl(var(--border-color))' }} />
                    <h5 className="mb-3" style={{ color: 'hsl(var(--primary))' }}>Detail Anak PKL</h5>
                    
                    <div className="form-group">
                      <label className="form-label">Sekolah / Instansi</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nama Sekolah atau Universitas"
                        value={sekolah}
                        onChange={(e) => setSekolah(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Jurusan</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Jurusan / Program Studi"
                        value={jurusan}
                        onChange={(e) => setJurusan(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2" style={{ display: 'flex', gap: '1rem' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Mulai PKL</label>
                        <input
                          type="date"
                          className="form-control"
                          value={tglMulai}
                          onChange={(e) => setTglMulai(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Selesai PKL</label>
                        <input
                          type="date"
                          className="form-control"
                          value={tglSelesai}
                          onChange={(e) => setTglSelesai(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="card-header d-flex justify-between" style={{ borderTop: '1px solid hsl(var(--border-color))' }}>
                <button type="button" onClick={() => setShowModal(null)} className="btn btn-secondary btn-sm" disabled={loading}>
                  Batal
                </button>
                <button type="submit" className="btn btn-success btn-sm" disabled={loading}>
                  {loading ? (
                    <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VIEW */}
      {showModal === 'view' && selectedUser && (
        <div className="overlay">
          <div className="modal-content">
            <div className="card-header d-flex justify-between align-center" style={{ borderBottom: '1px solid hsl(var(--border-color))' }}>
              <span style={{ fontWeight: 'bold' }}>👤 Detail Informasi Akun</span>
              <button
                onClick={() => setShowModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="card-body">
              <div className="profile-meta">
                <div className="profile-meta-item">
                  <span className="profile-label">Nama Lengkap</span>
                  <span className="profile-value">{selectedUser.nama}</span>
                </div>
                <div className="profile-meta-item">
                  <span className="profile-label">Username</span>
                  <span className="profile-value">{selectedUser.username}</span>
                </div>
                <div className="profile-meta-item">
                  <span className="profile-label">Peran</span>
                  <span className="profile-value" style={{ textTransform: 'capitalize' }}>{selectedUser.role}</span>
                </div>
                
                {selectedUser.role === 'anak_pkl' && (
                  <>
                    <div className="profile-meta-item">
                      <span className="profile-label">Asal Instansi/Sekolah</span>
                      <span className="profile-value">{selectedUser.sekolah || '-'}</span>
                    </div>
                    <div className="profile-meta-item">
                      <span className="profile-label">Jurusan</span>
                      <span className="profile-value">{selectedUser.jurusan || '-'}</span>
                    </div>
                    <div className="profile-meta-item">
                      <span className="profile-label">Tanggal Mulai PKL</span>
                      <span className="profile-value">{formatDate(selectedUser.tgl_mulai)}</span>
                    </div>
                    <div className="profile-meta-item">
                      <span className="profile-label">Tanggal Selesai PKL</span>
                      <span className="profile-value">{formatDate(selectedUser.tgl_selesai)}</span>
                    </div>
                  </>
                )}
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowModal(null)} className="btn btn-secondary btn-sm">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
