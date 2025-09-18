export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { ListObjectsV2Command } from '@aws-sdk/client-s3'

import { db } from '@/db'
import { objectTable } from '@/db/schema'
import { validateRequest } from '@/server/auth/validate'
import { R2_BUCKET_NAME, createR2Client } from '@/server/clients/r2'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  const { user } = await validateRequest()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { publicId } = await params
  if (!publicId) return NextResponse.json({ error: 'Invalid publicId' }, { status: 400 })
  const rows = await db.select().from(objectTable).where(and(eq(objectTable.publicId, publicId), eq(objectTable.userId, user.id)))
  const obj = rows[0]
  if (!obj) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const client = createR2Client()
  const base = obj.cfR2Link || `${obj.collectionId}/${obj.userId}`
  const prefix = `${base}/`
  const resp = await client.send(new ListObjectsV2Command({ Bucket: R2_BUCKET_NAME, Prefix: prefix, Delimiter: '/' }))
  const items = (resp.Contents || [])
    .map((o) => o.Key)
    .filter((k): k is string => Boolean(k))
    .map((k) => ({ key: k, iteration: parseInt(k.split('/').pop() || '0', 10) }))
    .filter((i) => i.iteration >= 1 && i.iteration <= 5)
    .sort((a, b) => a.iteration - b.iteration)

  return NextResponse.json({ items })
}
