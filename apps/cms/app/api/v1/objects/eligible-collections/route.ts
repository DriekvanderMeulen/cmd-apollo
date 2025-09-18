import { NextRequest, NextResponse } from 'next/server'
import { and, eq, like, notInArray } from 'drizzle-orm'

import { db } from '@/db'
import { collectionTable, objectTable, tenantTable, userTable } from '@/db/schema'
import { validateRequest } from '@/server/auth/validate'

export async function GET(req: NextRequest) {
  const { user } = await validateRequest()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch tenant name for user to filter by name contains tenant-name
  const [tenantRow] = await db
    .select({ name: tenantTable.name })
    .from(tenantTable)
    .where(eq(tenantTable.id, user.tenantId))

  const tenantName = tenantRow?.name || ''

  // Find collections already used by this user
  const used = await db
    .select({ collectionId: objectTable.collectionId })
    .from(objectTable)
    .where(eq(objectTable.userId, user.id))
  const usedIds = used.map((u) => u.collectionId)

  // Filter collections: title contains tenantName, and not already used by the user
  const where = and(like(collectionTable.title, `%${tenantName}%`), usedIds.length ? notInArray(collectionTable.id, usedIds) : undefined)

  const rows = await db.select({ id: collectionTable.id, title: collectionTable.title }).from(collectionTable).where(where as any)
  return NextResponse.json({ items: rows })
}


