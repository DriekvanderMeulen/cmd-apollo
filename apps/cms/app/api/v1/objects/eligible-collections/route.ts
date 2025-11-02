import { NextRequest, NextResponse } from "next/server";
import { and, eq, like, notInArray } from "drizzle-orm";

import { db } from "@/db";
import {
  collectionTable,
  objectTable,
  tenantTable,
  userTable,
} from "@/db/schema";
import { validateRequest } from "@/server/auth/validate";

export async function GET(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  console.log("GET /api/v1/objects/eligible-collections - User:", user.id, "TenantId:", user.tenantId);

  // Fetch tenant name for user to filter by name contains tenant-name
  const [tenantRow] = await db
    .select({ name: tenantTable.name })
    .from(tenantTable)
    .where(eq(tenantTable.id, user.tenantId));

  const tenantName = tenantRow?.name || "";
  console.log("GET /api/v1/objects/eligible-collections - Tenant name:", tenantName);

  // Find collections already used by this user
  const used = await db
    .select({ collectionId: objectTable.collectionId })
    .from(objectTable)
    .where(eq(objectTable.userId, user.id));
  const usedIds = used.map((u) => u.collectionId);
  console.log("GET /api/v1/objects/eligible-collections - Used collection IDs:", usedIds);

  // Get all collections first to see what's available
  const allCollections = await db
    .select({ id: collectionTable.id, title: collectionTable.title })
    .from(collectionTable);
  console.log("GET /api/v1/objects/eligible-collections - All collections:", allCollections);

  // TEMPORARY: Return all collections for debugging
  // TODO: Re-enable filtering once we understand the issue
  const rows = await db
    .select({ id: collectionTable.id, title: collectionTable.title })
    .from(collectionTable);
  
  console.log("GET /api/v1/objects/eligible-collections - Returning all collections:", rows);
  return NextResponse.json({ items: rows });

  // Original filtering logic (commented out for debugging):
  // const where = and(
  //   like(collectionTable.title, `%${tenantName}%`),
  //   usedIds.length ? notInArray(collectionTable.id, usedIds) : undefined,
  // );
  // const rows = await db
  //   .select({ id: collectionTable.id, title: collectionTable.title })
  //   .from(collectionTable)
  //   .where(where as any);
}
