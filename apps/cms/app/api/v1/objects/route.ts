import { NextRequest, NextResponse } from "next/server"
import { and, asc, count, desc, eq, like } from "drizzle-orm"

import { db } from "@/db"
import { categoryTable, collectionTable, objectTable } from "@/db/schema"
import { validateRequest } from "@/server/auth/validate"

export async function GET(req: NextRequest) {
  const { user } = await validateRequest()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get("page") || 1))
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || 10)))
  const q = (searchParams.get("q") || "").trim()
  const sort = (searchParams.get("sort") || "createdAt:desc").toLowerCase()

  const offset = (page - 1) * pageSize
  const where = and(eq(objectTable.userId, user.id), q ? like(objectTable.title, `%${q}%`) : undefined)

  const orderBy = sort.startsWith("title:")
    ? (sort.endsWith("asc") ? asc(objectTable.title) : desc(objectTable.title))
    : desc(objectTable.id)

  const [rows, total] = await Promise.all([
    db
      .select({
        id: objectTable.id,
        publicId: objectTable.publicId,
        title: objectTable.title,
        description: objectTable.description,
        userId: objectTable.userId,
        collectionId: objectTable.collectionId,
        categoryId: objectTable.categoryId,
        cfR2Link: objectTable.cfR2Link,
        collectionTitle: collectionTable.title,
        categoryTitle: categoryTable.title,
      })
      .from(objectTable)
      .leftJoin(collectionTable, eq(objectTable.collectionId, collectionTable.id))
      .leftJoin(categoryTable, eq(objectTable.categoryId, categoryTable.id))
      .where(where as any)
      .orderBy(orderBy as any)
      .limit(pageSize)
      .offset(offset),
    db.select({ value: count() }).from(objectTable).where(where as any),
  ])

  return NextResponse.json({ items: rows, total: total[0]?.value || 0 })
}

export async function POST(req: NextRequest) {
  const { user } = await validateRequest()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => null)
  if (!body || !body.title || !body.collectionId) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  // Enforce one object per (user, collection)
  const existing = await db
    .select({ id: objectTable.id })
    .from(objectTable)
    .where(and(eq(objectTable.userId, user.id), eq(objectTable.collectionId, Number(body.collectionId))))
  if (existing.length > 0) {
    return NextResponse.json({ error: "Object for this collection already exists" }, { status: 409 })
  }

  const insert = await db.insert(objectTable).values({
    title: String(body.title),
    description: body.description ? String(body.description) : null,
    userId: user.id,
    collectionId: Number(body.collectionId),
    categoryId: body.categoryId ? Number(body.categoryId) : null,
    // Save base R2 path up to userId (iterations stored as /1..5 below this)
    cfR2Link: `${Number(body.collectionId)}/${user.id}`,
    public: Boolean(body.public ?? false),
  })

  const insertId = (insert as any)?.insertId
  // Fallback resolve id if driver didn't return insertId
  let id = insertId
  if (!Number.isFinite(id)) {
    const latest = await db
      .select({ id: objectTable.id })
      .from(objectTable)
      .where(and(eq(objectTable.userId, user.id)))
      .orderBy(desc(objectTable.id))
      .limit(1)
    id = latest[0]?.id
  }

  // Fetch the created row to return publicId
  const createdRows = await db
    .select({ id: objectTable.id, publicId: objectTable.publicId })
    .from(objectTable)
    .where(and(eq(objectTable.id, id), eq(objectTable.userId, user.id)))
    .limit(1)
  const created = createdRows[0]
  return NextResponse.json({ ok: true, id, publicId: created?.publicId })
}


