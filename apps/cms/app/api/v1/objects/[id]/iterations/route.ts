import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { objectTable, iterationTable } from "@/db/schema";
import { validateRequest } from "@/server/auth/validate";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  // Verify object ownership
  const objectRows = await db
    .select()
    .from(objectTable)
    .where(and(eq(objectTable.id, id), eq(objectTable.userId, user.id)));
  const obj = objectRows[0];
  if (!obj) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get iterations
  const iterations = await db
    .select()
    .from(iterationTable)
    .where(eq(iterationTable.objectId, id))
    .orderBy(asc(iterationTable.createdAt));

  return NextResponse.json({ items: iterations });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  // Verify object ownership
  const objectRows = await db
    .select()
    .from(objectTable)
    .where(and(eq(objectTable.id, id), eq(objectTable.userId, user.id)));
  const obj = objectRows[0];
  if (!obj) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body || !body.title || !body.date) {
    return NextResponse.json(
      { error: "Invalid body. Title and date are required." },
      { status: 400 },
    );
  }

  try {
    const insert = await db.insert(iterationTable).values({
      objectId: id,
      title: String(body.title),
      date: new Date(body.date),
      description: body.description || null,
    });

    const insertId = (insert as any)?.insertId;
    // Fallback resolve id if driver didn't return insertId
    let iterationId = insertId;
    if (!Number.isFinite(iterationId)) {
      const latest = await db
        .select({ id: iterationTable.id })
        .from(iterationTable)
        .where(eq(iterationTable.objectId, id))
        .orderBy(asc(iterationTable.id))
        .limit(1);
      iterationId = latest[0]?.id;
    }

    return NextResponse.json({ ok: true, id: iterationId });
  } catch (e: any) {
    console.error("Failed to create iteration", e);
    return NextResponse.json(
      { error: "Failed to create iteration" },
      { status: 500 },
    );
  }
}
