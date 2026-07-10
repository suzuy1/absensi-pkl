'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, User, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Login gagal')
      }

      // Redirect berdasarkan role
      if (data.role === 'admin') {
        router.push('/dashboard-admin')
      } else if (data.role === 'pembimbing') {
        router.push('/dashboard-pembimbing')
      } else {
        router.push('/dashboard-pkl')
      }
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Username atau Password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
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
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
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
