'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation, Trash2, Save, Loader2 } from 'lucide-react'

interface AttendanceRecord {
  id: number
  nama: string
  tanggal: string
  jam_hadir: string | null
  jam_pulang: string | null
  lokasi: string | null
  latitude: string | null
  longitude: string | null
}

interface AttendanceTableProps {
  records: AttendanceRecord[]
}

export default function AttendanceTable({ records: initialRecords }: AttendanceTableProps) {
  const [records, setRecords] = useState(initialRecords)
  const [editValues, setEditValues] = useState<{ [key: number]: string }>({})
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const router = useRouter()

  const handleLocationChange = (id: number, value: string) => {
    setEditValues((prev) => ({ ...prev, [id]: value }))
  }

  const handleSaveLocation = async (id: number) => {
    const newLocation = editValues[id]
    if (newLocation === undefined) return

    setLoadingId(id)
    try {
      const res = await fetch('/api/absensi', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, lokasi: newLocation }),
      })

      if (!res.ok) {
        throw new Error('Gagal memperbarui lokasi')
      }

      setRecords((prev) =>
        prev.map((rec) => (rec.id === id ? { ...rec, lokasi: newLocation } : rec))
      )
      alert('Lokasi berhasil disimpan!')
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Gagal menyimpan lokasi')
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data absensi ini?')) return

    setLoadingId(id)
    try {
      const res = await fetch(`/api/absensi?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Gagal menghapus data')
      }

      setRecords((prev) => prev.filter((rec) => rec.id !== id))
      alert('Data absensi berhasil dihapus!')
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Gagal menghapus data')
    } finally {
      setLoadingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch (e) {
      return dateStr
    }
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: '50px', textAlign: 'center' }}>No</th>
            <th>Nama</th>
            <th>Tanggal</th>
            <th>Jam Masuk</th>
            <th>Jam Pulang</th>
            <th>Status</th>
            <th>Lokasi</th>
            <th style={{ width: '80px', textAlign: 'center' }}>Maps</th>
            <th style={{ width: '120px', textAlign: 'center' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={9} className="table-no-data">
                Tidak ada data absensi.
              </td>
            </tr>
          ) : (
            records.map((row, index) => {
              const currentLocValue = editValues[row.id] !== undefined ? editValues[row.id] : row.lokasi || ''
              const isModified = currentLocValue !== (row.lokasi || '')
              const isLoading = loadingId === row.id

              return (
                <tr key={row.id}>
                  <td style={{ textAlign: 'center' }}>{index + 1}</td>
                  <td>
                    <strong>{row.nama}</strong>
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
                  <td>
                    <div className="form-inline-edit">
                      <input
                        type="text"
                        className="form-control"
                        value={currentLocValue}
                        onChange={(e) => handleLocationChange(row.id, e.target.value)}
                        disabled={isLoading}
                        style={{ minWidth: '200px' }}
                      />
                      {isModified && (
                        <button
                          onClick={() => handleSaveLocation(row.id)}
                          className="btn btn-success btn-sm"
                          title="Simpan Perubahan"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={14} />
                          ) : (
                            <Save size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.latitude && row.longitude ? (
                      <a
                        href={`https://www.google.com/maps?q=${row.latitude},${row.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                        title="Buka Peta"
                      >
                        <Navigation size={14} />
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>-</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="btn btn-danger btn-sm"
                      disabled={isLoading}
                    >
                      <Trash2 size={14} />
                      Hapus
                    </button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
