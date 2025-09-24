import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3"

import { db } from "@/db"
import { objectTable } from "@/db/schema"
import { validateRequest } from "@/server/auth/validate"
import { R2_BUCKET_NAME, createR2Client } from "@/server/clients/r2"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await validateRequest()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: idStr } = await params
  const id = Number(idStr)
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  const rows = await db.select().from(objectTable).where(and(eq(objectTable.id, id), eq(objectTable.userId, user.id)))
  const obj = rows[0]
  if (!obj) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(obj)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await validateRequest()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: idStr } = await params
  const id = Number(idStr)
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  const data: any = {}
  if (typeof body.title === "string") data.title = body.title
  if (typeof body.description === "string" || body.description === null) data.description = body.description
  if (typeof body.categoryId === "number" || body.categoryId === null) data.categoryId = body.categoryId
  if (typeof body.cfR2Link === "string" || body.cfR2Link === null) data.cfR2Link = body.cfR2Link

  await db.update(objectTable).set(data).where(and(eq(objectTable.id, id), eq(objectTable.userId, user.id)))
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await validateRequest()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: idStr } = await params
  const id = Number(idStr)
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  const rows = await db.select().from(objectTable).where(and(eq(objectTable.id, id), eq(objectTable.userId, user.id)))
  const obj = rows[0]
  if (!obj) return NextResponse.json({ ok: true })
  try {
    const client = createR2Client()
    // Delete legacy single key if present
    if (obj.cfR2Link) {
      await client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: obj.cfR2Link }))
    }
    // Delete up to 5 iteration keys under the stored base path
    const base = obj.cfR2Link || `${obj.collectionId}/${obj.userId}`
    for (let i = 1; i <= 5; i++) {
      const key = `${base}/${i}`
      await client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }))
    }
  } catch {}
  await db.delete(objectTable).where(and(eq(objectTable.id, id), eq(objectTable.userId, user.id)))
  return NextResponse.json({ ok: true })
}


