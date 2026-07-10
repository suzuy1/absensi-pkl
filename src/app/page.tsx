import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decrypt } from '@/lib/auth'

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const user = token ? await decrypt(token) : null

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'admin') {
    redirect('/dashboard-admin')
  } else if (user.role === 'pembimbing') {
    redirect('/dashboard-pembimbing')
  } else {
    redirect('/dashboard-pkl')
  }
}
