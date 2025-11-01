// app/api/v1/app/objects/route.ts
import { and, asc, eq, gt, like } from "drizzle-orm";
import { requireAuthContext } from "@/lib/authContext";
import { db, objectTable, userTable } from "@/db";

export async function GET(req: Request): Promise<Response> {
  await requireAuthContext(req);

  const url = new URL(req.url);
  const categoryIdParam = url.searchParams.get("categoryId");
  const collectionIdParam = url.searchParams.get("collectionId");
  const search = url.searchParams.get("search") || "";
  const cursor = url.searchParams.get("cursor");
  const tenantIdParam = url.searchParams.get("tenantId");
  const limitParam = url.searchParams.get("limit");

  const limit = Math.min(Math.max(Number(limitParam || 50), 1), 200);

  const wheres = [] as Array<ReturnType<typeof and>> | any;
  if (categoryIdParam)
    wheres.push(eq(objectTable.categoryId, Number(categoryIdParam)));
  if (collectionIdParam)
    wheres.push(eq(objectTable.collectionId, Number(collectionIdParam)));
  if (search) wheres.push(like(objectTable.title, `%${search}%`));
  if (cursor) wheres.push(gt(objectTable.publicId, cursor));
  if (tenantIdParam) wheres.push(eq(userTable.tenantId, Number(tenantIdParam)));
  // Only show public objects
  wheres.push(eq(objectTable.public, true));

  const rows = await db
    .select({
      id: objectTable.id,
      publicId: objectTable.publicId,
      title: objectTable.title,
      categoryId: objectTable.categoryId,
      collectionId: objectTable.collectionId,
      cfR2Link: objectTable.cfR2Link,
      userGivenName: userTable.givenName,
      userFamilyName: userTable.familyName,
      userEmail: userTable.email,
      tenantId: userTable.tenantId,
    })
    .from(objectTable)
    .leftJoin(userTable, eq(userTable.id, objectTable.userId))
    .where(wheres.length > 0 ? and(...wheres) : undefined)
    .orderBy(asc(objectTable.publicId))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  // Provide an updatedAt placeholder until schema has timestamps
  const data = page.map((r) => ({
    id: r.id,
    publicId: r.publicId,
    title: r.title,
    categoryId: r.categoryId,
    collectionId: r.collectionId,
    cfR2Link: r.cfR2Link,
    tenantId: r.tenantId,
    username:
      r.userGivenName || r.userFamilyName
        ? `${r.userGivenName ?? ""} ${r.userFamilyName ?? ""}`.trim()
        : r.userEmail,
    updatedAt: new Date().toISOString(),
  }));
  const nextCursor = hasMore ? rows[rows.length - 1].publicId : null;

  return Response.json({ data, nextCursor });
}
