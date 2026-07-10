'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Check, LogOut, Navigation, Loader2 } from 'lucide-react'

interface AttendanceFormProps {
  // Data absensi hari ini yang dikirim dari Server Component
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
  // State lokal untuk menampung alamat lokasi, titik koordinat, status loading, dan notifikasi
  const [lokasi, setLokasi] = useState(initialData?.lokasi || 'Mendeteksi lokasi...')
  const [latitude, setLatitude] = useState(initialData?.latitude || '')
  const [longitude, setLongitude] = useState(initialData?.longitude || '')
  const [loading, setLoading] = useState(false) // Spinner loading saat kirim data ke API
  const [locating, setLocating] = useState(true) // Spinner loading saat melacak koordinat GPS
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Jika sudah melakukan absen masuk dan pulang hari ini, pelacakan GPS tidak diperlukan lagi
    if (initialData?.jam_hadir && initialData?.jam_pulang) {
      setLocating(false)
      return
    }

    // Menggunakan Geolocation API bawaan browser untuk melacak lokasi GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          setLatitude(String(lat))
          setLongitude(String(lon))

          try {
            // Memanggil API gratis OpenStreetMap (Nominatim) untuk menerjemahkan Lat/Lon menjadi alamat jalan fisik
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
            )
            const data = await response.json()
            // Simpan alamat lengkap ke state lokasi
            setLokasi(data.display_name || `Lat: ${lat}, Lon: ${lon}`)
          } catch (err) {
            // Jika API geocoding gagal, gunakan fallback koordinat mentah saja
            setLokasi(`Lat: ${lat}, Lon: ${lon} (Gagal mengambil alamat lengkap)`)
          } finally {
            setLocating(false)
          }
        },
        (error) => {
          // Callback jika izin lokasi ditolak oleh user di browser
          setError(
            'Gagal mendeteksi lokasi. Pastikan izin GPS/Lokasi diaktifkan pada browser Anda!'
          )
          setLokasi('Izin lokasi ditolak.')
          setLocating(false)
        },
        { enableHighAccuracy: true } // Memaksa pelacakan akurasi tinggi (menggunakan modul GPS fisik jika ada)
      )
    } else {
      setError('Browser Anda tidak mendukung Geolocation.')
      setLocating(false)
    }
  }, [initialData])

  // Fungsi untuk mengirim data absensi ke API Route (masuk / pulang)
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
      // Memaksa Next.js melakukan re-fetch data server-side terbaru di dashboard_pkl
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
        {/* Notifikasi feedback sukses / error */}
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Input Read-Only Alamat */}
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

        {/* Render tombol secara dinamis berdasarkan status absensi hari ini */}
        <div className="mt-4">
          {locating ? (
            <button className="btn btn-secondary w-full" disabled>
              <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={20} />
              Sedang Mendeteksi Lokasi...
            </button>
          ) : !initialData ? (
            // Jika belum absen sama sekali hari ini
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
            // Jika sudah absen masuk, tetapi belum absen pulang
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
            // Jika absen masuk dan pulang hari ini sudah lengkap
            <button className="btn btn-secondary w-full btn-lg" disabled>
              <Check size={24} />
              Absensi Hari Ini Selesai
            </button>
          )}
        </div>

        {/* Tombol navigasi eksternal ke Google Maps */}
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
