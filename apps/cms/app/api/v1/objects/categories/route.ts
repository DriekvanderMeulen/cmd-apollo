import { NextRequest, NextResponse } from "next/server";
import { asc } from "drizzle-orm";

import { db } from "@/db";
import { categoryTable } from "@/db/schema";
import { validateRequest } from "@/server/auth/validate";

export async function GET(_req: NextRequest) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db
    .select({ id: categoryTable.id, title: categoryTable.title })
    .from(categoryTable)
    .orderBy(asc(categoryTable.title));
  return NextResponse.json({ items: rows });
}
