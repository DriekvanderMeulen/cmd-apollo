export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

import { db } from '@/db'
import { objectTable } from '@/db/schema'
import { validateRequest } from '@/server/auth/validate'
import { R2_BUCKET_NAME, createR2Client } from '@/server/clients/r2'

function buildKey(basePath: string | null, collectionId: number, userId: number, objectId: number, iteration: number) {
  // Prefer stored base up to userId if present; else fallback to collection/object
  const base = basePath && basePath.includes('/') ? basePath : `${collectionId}/${userId}`
  return `${base}/${iteration}`
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ publicId: string; iteration: string }> }) {
  const { user } = await validateRequest()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { publicId, iteration: itRaw } = await params
  const iteration = Number(itRaw)
  if (!publicId) return NextResponse.json({ error: 'Invalid publicId' }, { status: 400 })
  if (!(iteration >= 1 && iteration <= 5)) return NextResponse.json({ error: 'Invalid iteration' }, { status: 400 })
  const rows = await db.select().from(objectTable).where(and(eq(objectTable.publicId, publicId), eq(objectTable.userId, user.id)))
  const obj = rows[0]
  if (!obj) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const form = await req.formData().catch(() => null)
  const file = form?.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'File is required' }, { status: 400 })
  const client = createR2Client()
  const arrayBuffer = await file.arrayBuffer()
  try {
    const Key = buildKey(obj.cfR2Link || null, obj.collectionId, obj.userId, obj.id, iteration)
    const res = await client.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key,
      Body: Buffer.from(arrayBuffer),
      ContentType: file.type || 'application/octet-stream',
    }))
    return NextResponse.json({ ok: true, key: Key, etag: (res as any)?.ETag })
  } catch (e: any) {
    console.error('R2 PutObject failed', { message: e?.message, name: e?.name, code: e?.$metadata?.httpStatusCode })
    return NextResponse.json({ error: 'Upload failed', detail: e?.message || 'unknown' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ publicId: string; iteration: string }> }) {
  const { user } = await validateRequest()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { publicId, iteration: itRaw } = await params
  const iteration = Number(itRaw)
  if (!publicId) return NextResponse.json({ error: 'Invalid publicId' }, { status: 400 })
  if (!(iteration >= 1 && iteration <= 5)) return NextResponse.json({ error: 'Invalid iteration' }, { status: 400 })
  const rows = await db.select().from(objectTable).where(and(eq(objectTable.publicId, publicId), eq(objectTable.userId, user.id)))
  const obj = rows[0]
  if (!obj) return NextResponse.json({ ok: true })
  const client = createR2Client()
  await client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: buildKey(obj.cfR2Link || null, obj.collectionId, obj.userId, obj.id, iteration) }))
  return NextResponse.json({ ok: true })
}
