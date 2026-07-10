import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from './lib/auth'

/**
 * Middleware ini berfungsi sebagai "satpam" pintu gerbang rute aplikasi.
 * Setiap kali pengguna berpindah halaman, fungsi ini akan dieksekusi terlebih dahulu.
 */
export async function middleware(request: NextRequest) {
  // Mengambil jalur (path) URL yang sedang diakses pengguna (contoh: /dashboard-admin)
  const path = request.nextUrl.pathname

  // 1. Mengambil token session yang tersimpan di Cookie browser
  const token = request.cookies.get('session')?.value

  // 2. Mendekripsi token JWT tersebut untuk membaca data pengguna (id, nama, role)
  const user = token ? await decrypt(token) : null

  // 3. Menentukan halaman yang sifatnya publik (tidak butuh login untuk diakses)
  const isPublicPath = path === '/login'

  // 4. JIKA pengguna BELUM LOGIN dan mencoba mengakses halaman terproteksi (misal dashboard)
  if (!user && !isPublicPath) {
    // Abaikan/izinkan akses untuk aset internal Next.js, gambar favicon, dan rute API auth
    if (
      path.startsWith('/_next') ||
      path.startsWith('/favicon.ico') ||
      path.startsWith('/api/auth')
    ) {
      return NextResponse.next()
    }
    // Alihkan paksa pengguna kembali ke halaman Login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 5. JIKA pengguna SUDAH LOGIN tetapi mencoba membuka halaman Login kembali
  if (user && isPublicPath) {
    // Alihkan langsung ke dashboard masing-masing sesuai hak aksesnya (role)
    if (user.role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard-admin', request.url))
    } else if (user.role === 'pembimbing') {
      return NextResponse.redirect(new URL('/dashboard-pembimbing', request.url))
    } else if (user.role === 'anak_pkl') {
      return NextResponse.redirect(new URL('/dashboard-pkl', request.url))
    }
  }

  // 6. Proteksi halaman internal berdasarkan Role agar tidak saling tembus
  if (user) {
    // Jika mengakses halaman utama root (/), arahkan langsung ke dashboard sesuai role
    if (path === '/') {
      if (user.role === 'admin') {
        return NextResponse.redirect(new URL('/dashboard-admin', request.url))
      } else if (user.role === 'pembimbing') {
        return NextResponse.redirect(new URL('/dashboard-pembimbing', request.url))
      } else if (user.role === 'anak_pkl') {
        return NextResponse.redirect(new URL('/dashboard-pkl', request.url))
      }
    }

    // Jika user biasa mencoba masuk ke halaman Admin, tolak dan alihkan
    if (path.startsWith('/dashboard-admin') && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (path.startsWith('/admin') && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    // Jika selain pembimbing mencoba masuk ke halaman Pembimbing, tolak
    if (path.startsWith('/dashboard-pembimbing') && user.role !== 'pembimbing') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    // Jika selain anak PKL mencoba masuk ke dashboard absen, tolak
    if (path.startsWith('/dashboard-pkl') && user.role !== 'anak_pkl') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Izinkan akses jika semua verifikasi di atas lolos
  return NextResponse.next()
}

// Menentukan rute-rute mana saja yang akan diproses oleh middleware ini
export const config = {
  // Memproses seluruh halaman kecuali rute file statis (gambar, css, js) dan rute login API
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
