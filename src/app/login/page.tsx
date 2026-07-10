'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, User, Loader2 } from 'lucide-react'

export default function LoginPage() {
  // State lokal untuk menampung input user, pesan error, dan status loading
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Fungsi yang dipanggil saat form login disubmit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault() // Mencegah reload halaman secara default browser
    setError('')
    setLoading(true) // Aktifkan animasi loading spinner dan overlay

    try {
      // 1. Mengirim permintaan verifikasi kredensial ke API Route internal kita
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      // Jika server mengembalikan status error (bukan 2xx)
      if (!res.ok) {
        throw new Error(data.message || 'Login gagal')
      }

      // 2. Jika sukses, alihkan rute pengguna sesuai hak aksesnya (role)
      if (data.role === 'admin') {
        router.push('/dashboard-admin')
      } else if (data.role === 'pembimbing') {
        router.push('/dashboard-pembimbing')
      } else {
        router.push('/dashboard-pkl')
      }
      
      // Memaksa Next.js menyegarkan data server di halaman tujuan
      router.refresh()
      
      // CATATAN UX: Kami sengaja TIDAK mematikan loading state (setLoading(false)) di sini
      // agar lingkaran loading terus berputar menutupi layar sampai halaman dashboard baru termuat penuh.
      
    } catch (err: any) {
      // Jika terjadi error, tampilkan pesan kegagalan dan matikan loading agar user bisa input ulang
      setError(err.message || 'Username atau Password salah')
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Overlay loading bulat dan notifikasi teks yang muncul saat state loading = true */}
        {loading && (
          <div className="login-loading-overlay">
            <div className="spinner"></div>
            <p className="loading-text">Menghubungkan ke database Supabase, mohon tunggu...</p>
          </div>
        )}
        
        <div className="login-logo text-center">
          📍
        </div>
        <h2 className="login-title">Sistem Absensi PKL</h2>
        
        {/* Menampilkan box notifikasi error merah jika kredensial salah */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Input Username */}
          <div className="form-group">
            <label className="form-label" style={{ color: 'white' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#64748b' 
                }} 
              />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Masukkan Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ color: 'white' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#64748b' 
                }} 
              />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Masukkan Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            className="btn btn-success w-full"
            style={{ height: '3.25rem', fontSize: '1.05rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={20} />
                Memproses...
              </>
            ) : (
              'Masuk Aplikasi'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
