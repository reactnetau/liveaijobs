import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'employer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const job_id = searchParams.get('job_id')

  const where = job_id
    ? { job_id, job: { employer_id: session.userId } }
    : { job: { employer_id: session.userId } }

  const applications = await prisma.application.findMany({
    where,
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      resume_url: true,
      cover_letter: true,
      created_at: true,
      job: {
        select: { id: true, title: true, company_name: true },
      },
    },
  })

  return NextResponse.json(applications)
}
