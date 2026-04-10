import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const EMPLOYER_ROUTES = ['/employer']
const SEEKER_ROUTES = ['/applications']
const AUTH_ONLY = ['/login', '/signup']

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? '')
}

interface TokenPayload {
  userId: string
  email: string
  role: 'employer' | 'job_seeker'
}

async function getTokenPayload(req: NextRequest): Promise<TokenPayload | null> {
  const token = req.cookies.get('token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = await getTokenPayload(req)

  const isEmployerRoute = EMPLOYER_ROUTES.some((p) => pathname.startsWith(p))
  const isSeekerRoute = SEEKER_ROUTES.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_ONLY.some((p) => pathname === p)

  // Redirect unauthenticated users away from protected routes
  if ((isEmployerRoute || isSeekerRoute) && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Enforce role-based access
  if (isEmployerRoute && session && session.role !== 'employer') {
    return NextResponse.redirect(new URL('/jobs', req.url))
  }

  if (isSeekerRoute && session && session.role !== 'job_seeker') {
    return NextResponse.redirect(new URL('/employer/dashboard', req.url))
  }

  // Redirect authenticated users away from login/signup
  if (isAuthPage && session) {
    const dest = session.role === 'employer' ? '/employer/dashboard' : '/jobs'
    return NextResponse.redirect(new URL(dest, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/employer/:path*',
    '/applications/:path*',
    '/login',
    '/signup',
  ],
}
