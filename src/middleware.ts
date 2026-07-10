import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from './lib/auth'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 1. Dapatkan token session dari cookies
  const token = request.cookies.get('session')?.value

  // 2. Dekripsi token untuk dapatkan data user
  const user = token ? await decrypt(token) : null

  // 3. Rute yang tidak memerlukan login (Public)
  const isPublicPath = path === '/login'

  // 4. Jika user belum login dan mencoba mengakses rute terproteksi
  if (!user && !isPublicPath) {
    // Abaikan static files dan API routes kecuali API dashboard
    if (
      path.startsWith('/_next') ||
      path.startsWith('/favicon.ico') ||
      path.startsWith('/api/auth')
    ) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 5. Jika user sudah login dan mencoba membuka halaman login
  if (user && isPublicPath) {
    if (user.role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard-admin', request.url))
    } else if (user.role === 'pembimbing') {
      return NextResponse.redirect(new URL('/dashboard-pembimbing', request.url))
    } else if (user.role === 'anak_pkl') {
      return NextResponse.redirect(new URL('/dashboard-pkl', request.url))
    }
  }

  // 6. Proteksi halaman berdasarkan role masing-masing
  if (user) {
    if (path === '/') {
      if (user.role === 'admin') {
        return NextResponse.redirect(new URL('/dashboard-admin', request.url))
      } else if (user.role === 'pembimbing') {
        return NextResponse.redirect(new URL('/dashboard-pembimbing', request.url))
      } else if (user.role === 'anak_pkl') {
        return NextResponse.redirect(new URL('/dashboard-pkl', request.url))
      }
    }

    if (path.startsWith('/dashboard-admin') && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (path.startsWith('/admin') && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (path.startsWith('/dashboard-pembimbing') && user.role !== 'pembimbing') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (path.startsWith('/dashboard-pkl') && user.role !== 'anak_pkl') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

// Konfigurasi matcher agar middleware berjalan di seluruh halaman
export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
