'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Check, LogOut, Navigation, Loader2 } from 'lucide-react'

interface AttendanceFormProps {
  initialData: {
    id: number
    jam_hadir: string | null
    jam_pulang: string | null
    lokasi: string | null
    latitude: string | null
    longitude: string | null
  } | null
}

export default function AttendanceForm({ initialData }: AttendanceFormProps) {
  const [lokasi, setLokasi] = useState(initialData?.lokasi || 'Mendeteksi lokasi...')
  const [latitude, setLatitude] = useState(initialData?.latitude || '')
  const [longitude, setLongitude] = useState(initialData?.longitude || '')
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (initialData?.jam_hadir && initialData?.jam_pulang) {
      setLocating(false)
      return
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          setLatitude(String(lat))
          setLongitude(String(lon))

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
            )
            const data = await response.json()
            setLokasi(data.display_name || `Lat: ${lat}, Lon: ${lon}`)
          } catch (err) {
            setLokasi(`Lat: ${lat}, Lon: ${lon} (Gagal mengambil alamat lengkap)`)
          } finally {
            setLocating(false)
          }
        },
        (error) => {
          setError(
            'Gagal mendeteksi lokasi. Pastikan izin GPS/Lokasi diaktifkan pada browser Anda!'
          )
          setLokasi('Izin lokasi ditolak.')
          setLocating(false)
        },
        { enableHighAccuracy: true }
      )
    } else {
      setError('Browser Anda tidak mendukung Geolocation.')
      setLocating(false)
    }
  }, [initialData])

  const handleSubmit = async (aksi: 'masuk' | 'pulang') => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/absensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lokasi,
          latitude,
          longitude,
          aksi,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan')
      }

      setSuccess(data.message)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card shadow">
      <div className="card-header bg-success" style={{ color: 'white', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
        <span className="d-flex align-center gap-2">
          <MapPin size={18} />
          Form Absensi
        </span>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-group">
          <label className="form-label">📍 Lokasi Saat Ini</label>
          <textarea
            className="form-control"
            value={lokasi}
            readOnly
            rows={3}
            style={{ resize: 'none' }}
          />
        </div>

        {latitude && longitude && (
          <div className="form-group">
            <span className="profile-label" style={{ fontSize: '0.85rem' }}>Koordinat: {latitude}, {longitude}</span>
          </div>
        )}

        <div className="mt-4">
          {locating ? (
            <button className="btn btn-secondary w-full" disabled>
              <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={20} />
              Sedang Mendeteksi Lokasi...
            </button>
          ) : !initialData ? (
            <button
              onClick={() => handleSubmit('masuk')}
              disabled={loading}
              className="btn btn-success w-full btn-lg"
            >
              {loading ? (
                <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={24} />
              ) : (
                <>
                  <Check size={24} />
                  Absen Masuk
                </>
              )}
            </button>
          ) : !initialData.jam_pulang ? (
            <button
              onClick={() => handleSubmit('pulang')}
              disabled={loading}
              className="btn btn-danger w-full btn-lg"
            >
              {loading ? (
                <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={24} />
              ) : (
                <>
                  <LogOut size={24} />
                  Absen Pulang
                </>
              )}
            </button>
          ) : (
            <button className="btn btn-secondary w-full btn-lg" disabled>
              <Check size={24} />
              Absensi Hari Ini Selesai
            </button>
          )}
        </div>

        {latitude && longitude && (
          <div className="mt-3">
            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full"
            >
              <Navigation size={18} />
              Buka di Google Maps
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
