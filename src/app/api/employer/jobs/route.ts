import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'employer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const jobs = await prisma.job.findMany({
    where: { employer_id: session.userId },
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      title: true,
      company_name: true,
      location: true,
      type: true,
      is_active: true,
      created_at: true,
      _count: { select: { applications: true } },
    },
  })

  return NextResponse.json(jobs)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'employer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, company_name, company_website, location, type, description, apply_type, apply_url } = body

  if (!title || !company_name || !location || !type || !description || !apply_type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!['full-time', 'part-time', 'contract', 'remote'].includes(type)) {
    return NextResponse.json({ error: 'Invalid job type' }, { status: 400 })
  }

  if (!['external', 'internal'].includes(apply_type)) {
    return NextResponse.json({ error: 'Invalid apply type' }, { status: 400 })
  }

  if (apply_type === 'external' && !apply_url) {
    return NextResponse.json({ error: 'External apply URL required' }, { status: 400 })
  }

  const job = await prisma.job.create({
    data: {
      employer_id: session.userId,
      title,
      company_name,
      company_website: company_website || null,
      location,
      type,
      description,
      apply_type,
      apply_url: apply_url || null,
      is_active: false,
    },
  })

  return NextResponse.json(job, { status: 201 })
}
