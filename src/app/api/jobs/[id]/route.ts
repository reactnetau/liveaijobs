import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await prisma.job.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      company_name: true,
      company_website: true,
      location: true,
      type: true,
      description: true,
      apply_type: true,
      apply_url: true,
      is_active: true,
      created_at: true,
    },
  })

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  if (!job.is_active) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  return NextResponse.json(job)
}
