import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const response = NextResponse.json({ message: 'Logout Berhasil' })

  response.cookies.set({
    name: 'session',
    value: '',
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  })

  return response
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const response = NextResponse.redirect(new URL('/login', requestUrl.origin))

  response.cookies.set({
    name: 'session',
    value: '',
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  })

  return response
}
