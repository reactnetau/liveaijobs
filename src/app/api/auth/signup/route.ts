import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password, and role required' }, { status: 400 })
    }

    if (role !== 'employer' && role !== 'job_seeker') {
      return NextResponse.json({ error: 'Role must be employer or job_seeker' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, password_hash, role },
    })

    const token = await signToken({ userId: user.id, email: user.email, role: user.role as 'employer' | 'job_seeker' })

    const res = NextResponse.json({ ok: true, role: user.role })
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  } catch (error) {
    console.error('Signup failed:', error)

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json({ error: 'Database connection failed. Check DATABASE_URL.' }, { status: 500 })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
      }
    }

    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
