import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { objectTable, iterationTable } from "@/db/schema";
import { validateRequest } from "@/server/auth/validate";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { publicId } = await params;

  // Verify object ownership
  const objectRows = await db
    .select()
    .from(objectTable)
    .where(
      and(eq(objectTable.publicId, publicId), eq(objectTable.userId, user.id)),
    );
  const obj = objectRows[0];
  if (!obj) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get iterations
  const iterations = await db
    .select()
    .from(iterationTable)
    .where(eq(iterationTable.objectId, obj.id))
    .orderBy(asc(iterationTable.createdAt));

  return NextResponse.json({ items: iterations });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { publicId } = await params;

  // Verify object ownership
  const objectRows = await db
    .select()
    .from(objectTable)
    .where(
      and(eq(objectTable.publicId, publicId), eq(objectTable.userId, user.id)),
    );
  const obj = objectRows[0];
  if (!obj) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body || !body.title || !body.date) {
    return NextResponse.json(
      { error: "Invalid body. Title and date are required." },
      { status: 400 },
    );
  }

  // Handle description - accept string or object, stringify if object
  let descriptionValue: string | null = null;
  if (body.description !== null && body.description !== undefined) {
    if (typeof body.description === 'string') {
      descriptionValue = body.description || null;
    } else if (typeof body.description === 'object') {
      descriptionValue = JSON.stringify(body.description);
    }
  }

  try {
    const insert = await db.insert(iterationTable).values({
      objectId: obj.id,
      title: String(body.title),
      date: new Date(body.date),
      description: descriptionValue,
    });

    const insertId = (insert as any)?.insertId;
    // Fallback resolve id if driver didn't return insertId
    let iterationId = insertId;
    if (!Number.isFinite(iterationId)) {
      const latest = await db
        .select({ id: iterationTable.id })
        .from(iterationTable)
        .where(eq(iterationTable.objectId, obj.id))
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
