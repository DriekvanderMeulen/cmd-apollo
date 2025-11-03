// app/api/app/categories/route.ts
import { requireAuthContext } from "@/lib/authContext";
import { db, categoryTable } from "@/db";

export async function GET(req: Request): Promise<Response> {
  await requireAuthContext(req);

  const rows = await db
    .select({
      id: categoryTable.id,
      publicId: categoryTable.publicId,
      title: categoryTable.title,
    })
    .from(categoryTable)
    .orderBy(categoryTable.title);

  return Response.json({ data: rows });
}
