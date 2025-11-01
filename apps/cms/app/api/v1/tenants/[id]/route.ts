import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { tenantTable } from "@/db/schema";
import { validateRequest } from "@/server/auth/validate";
import { eq } from "drizzle-orm";

function requireEditorOrAdmin(role: "ADMIN" | "EDITOR" | "USER") {
  if (role !== "ADMIN" && role !== "EDITOR") {
    throw new Error("Unauthorized: Editor or Admin required");
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    requireEditorOrAdmin(user.role as any);
  } catch (e) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name)
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  await db.update(tenantTable).set({ name }).where(eq(tenantTable.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    requireEditorOrAdmin(user.role as any);
  } catch (e) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await db.delete(tenantTable).where(eq(tenantTable.id, id));
  return NextResponse.json({ ok: true });
}
