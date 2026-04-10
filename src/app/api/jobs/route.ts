import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const jobs = await prisma.job.findMany({
    where: { is_active: true },
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      title: true,
      company_name: true,
      company_website: true,
      location: true,
      type: true,
      apply_type: true,
      created_at: true,
    },
  })
  return NextResponse.json(jobs)
}
