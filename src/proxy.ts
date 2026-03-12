import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.SESSION_SECRET || 'gerador-desculpas-super-secret-key-123'
const encodedKey = new TextEncoder().encode(secretKey)

export default async function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get('session')?.value
  let userId: string | null = null

  if (sessionToken) {
    try {
      const { payload } = await jwtVerify(sessionToken, encodedKey, {
        algorithms: ['HS256'],
      })
      userId = (payload as { userId: string }).userId
    } catch {
      userId = null
    }
  }

  const isProtected = request.nextUrl.pathname.startsWith('/gerador') || request.nextUrl.pathname.startsWith('/minhas-desculpas')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/registro')

  if (!userId && (isProtected || isAdminRoute)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (userId && isAuthPage) {
    return NextResponse.redirect(new URL('/gerador', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/gerador/:path*', '/minhas-desculpas/:path*', '/admin/:path*', '/login', '/registro'],
}
