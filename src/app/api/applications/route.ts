import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'job_seeker') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { job_id, name, email, resume_url, cover_letter } = body

  if (!job_id || !name || !email) {
    return NextResponse.json({ error: 'job_id, name, and email are required' }, { status: 400 })
  }

  const job = await prisma.job.findUnique({ where: { id: job_id } })
  if (!job || !job.is_active) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  const existing = await prisma.application.findFirst({
    where: { job_id, user_id: session.userId },
  })
  if (existing) {
    return NextResponse.json({ error: 'You have already applied to this job' }, { status: 409 })
  }

  const application = await prisma.application.create({
    data: {
      job_id,
      user_id: session.userId,
      name,
      email,
      resume_url: resume_url || null,
      cover_letter: cover_letter || null,
    },
  })

  return NextResponse.json(application, { status: 201 })
}

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'job_seeker') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const applications = await prisma.application.findMany({
    where: { user_id: session.userId },
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      resume_url: true,
      cover_letter: true,
      created_at: true,
      job: {
        select: { id: true, title: true, company_name: true, location: true, type: true },
      },
    },
  })

  return NextResponse.json(applications)
}
