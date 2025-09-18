import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { collectionTable } from "@/db/schema"
import { validateRequest } from "@/server/auth/validate"
import { asc, count, like } from "drizzle-orm"

function requireEditorOrAdmin(role: "ADMIN" | "EDITOR" | "USER") {
    if (role !== "ADMIN" && role !== "EDITOR") {
        throw new Error("Unauthorized: Editor or Admin required")
    }
}

export async function GET(req: NextRequest) {
    const { user } = await validateRequest()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    try {
        requireEditorOrAdmin(user.role as any)
    } catch (e) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get("page") || "1"))
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || "10")))
    const q = (searchParams.get("q") || "").trim()
    const offset = (page - 1) * pageSize

    const where = q ? like(collectionTable.title, `%${q}%`) : undefined

    const [rows, total] = await Promise.all([
        (where
            ? db.select().from(collectionTable).where(where).orderBy(asc(collectionTable.title)).limit(pageSize).offset(offset)
            : db.select().from(collectionTable).orderBy(asc(collectionTable.title)).limit(pageSize).offset(offset)),
        db.select({ value: count() }).from(collectionTable).where(where as any),
    ])

    return NextResponse.json({ items: rows, total: total[0]?.value || 0 })
}

export async function POST(req: NextRequest) {
    const { user } = await validateRequest()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    try {
        requireEditorOrAdmin(user.role as any)
    } catch (e) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => null)
    const title = body?.title?.trim()
    const tenantIdNum = Number(body?.tenantId)
    if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 })
    if (!Number.isFinite(tenantIdNum)) return NextResponse.json({ error: "Invalid tenantId" }, { status: 400 })
    await db.insert(collectionTable).values({ title, tenantId: tenantIdNum })
    return NextResponse.json({ ok: true })
}


