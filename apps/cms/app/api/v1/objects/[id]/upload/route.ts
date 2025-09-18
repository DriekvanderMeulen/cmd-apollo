export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { PutObjectCommand } from '@aws-sdk/client-s3'

import { db } from '@/db'
import { objectTable } from '@/db/schema'
import { validateRequest } from '@/server/auth/validate'
import { R2_BUCKET, createR2Client } from '@/server/clients/r2'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { user } = await validateRequest()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = Number(params.id)
  const rows = await db.select().from(objectTable).where(and(eq(objectTable.id, id), eq(objectTable.userId, user.id)))
  const obj = rows[0]
  if (!obj) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Invalid form' }, { status: 400 })
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'File is required' }, { status: 400 })

  const key = `${obj.collectionId}/${obj.id}`
  const client = createR2Client()
  const arrayBuffer = await file.arrayBuffer()
  await client.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: Buffer.from(arrayBuffer),
    ContentType: file.type || 'application/octet-stream',
  }))

  await db.update(objectTable).set({ cfR2Link: key }).where(eq(objectTable.id, obj.id))
  return NextResponse.json({ ok: true, key })
}


