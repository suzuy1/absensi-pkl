import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sistem Absensi PKL',
  description: 'Aplikasi Absensi PKL Online Terintegrasi Geolocation',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  )
}
