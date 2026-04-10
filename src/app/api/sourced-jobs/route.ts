import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const remote = searchParams.get('remote')
  const q = searchParams.get('q')?.trim()

  const where: Record<string, unknown> = {}

  if (remote === 'true') {
    where.is_remote = true
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { company: { contains: q, mode: 'insensitive' } },
      { location: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [jobs, total] = await Promise.all([
    prisma.scrapedJob.findMany({
      where,
      orderBy: { posted_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        is_remote: true,
        url: true,
        source: true,
        posted_at: true,
        created_at: true,
      },
    }),
    prisma.scrapedJob.count({ where }),
  ])

  return NextResponse.json({
    jobs,
    total,
    page,
    pages: Math.ceil(total / limit),
    limit,
  })
}
