import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { objectTable, iterationTable } from "@/db/schema";
import { validateRequest } from "@/server/auth/validate";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; iterationId: string }> },
) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idRaw, iterationId: iterationIdRaw } = await params;
  const id = Number(idRaw);
  const iterationId = Number(iterationIdRaw);

  if (!Number.isFinite(id) || !Number.isFinite(iterationId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // Verify object ownership
  const objectRows = await db
    .select()
    .from(objectTable)
    .where(and(eq(objectTable.id, id), eq(objectTable.userId, user.id)));
  const obj = objectRows[0];
  if (!obj) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify iteration belongs to object
  const iterationRows = await db
    .select()
    .from(iterationTable)
    .where(
      and(eq(iterationTable.id, iterationId), eq(iterationTable.objectId, id)),
    );
  const iteration = iterationRows[0];
  if (!iteration)
    return NextResponse.json({ error: "Iteration not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = String(body.title);
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.description !== undefined)
      updateData.description = body.description;

    await db
      .update(iterationTable)
      .set(updateData)
      .where(eq(iterationTable.id, iterationId));

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Failed to update iteration", e);
    return NextResponse.json(
      { error: "Failed to update iteration" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; iterationId: string }> },
) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idRaw, iterationId: iterationIdRaw } = await params;
  const id = Number(idRaw);
  const iterationId = Number(iterationIdRaw);

  if (!Number.isFinite(id) || !Number.isFinite(iterationId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // Verify object ownership
  const objectRows = await db
    .select()
    .from(objectTable)
    .where(and(eq(objectTable.id, id), eq(objectTable.userId, user.id)));
  const obj = objectRows[0];
  if (!obj) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify iteration belongs to object
  const iterationRows = await db
    .select()
    .from(iterationTable)
    .where(
      and(eq(iterationTable.id, iterationId), eq(iterationTable.objectId, id)),
    );
  const iteration = iterationRows[0];
  if (!iteration)
    return NextResponse.json({ error: "Iteration not found" }, { status: 404 });

  try {
    await db.delete(iterationTable).where(eq(iterationTable.id, iterationId));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Failed to delete iteration", e);
    return NextResponse.json(
      { error: "Failed to delete iteration" },
      { status: 500 },
    );
  }
}
