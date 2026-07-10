'use client'

import { useState, useEffect } from 'react'

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!time) {
    return (
      <div style={{ minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p>Memuat waktu...</p>
      </div>
    )
  }

  return (
    <div style={{ margin: '1rem 0' }}>
      <p style={{ fontWeight: '600', fontSize: '1.05rem', marginBottom: '0.25rem' }}>
        📅 Tanggal: {time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      <p style={{ fontWeight: '700', fontSize: '1.5rem', color: 'hsl(var(--primary))' }}>
        🕒 Jam: {time.toLocaleTimeString('id-ID')}
      </p>
    </div>
  )
}
