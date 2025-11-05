// app/api/app/categories/route.ts
import { requireBearerToken } from "@/lib/bearerAuth";
import { db, categoryTable } from "@/db";

export async function GET(req: Request): Promise<Response> {
  try {
    requireBearerToken(req);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    return new Response("Unauthorized", { status: 401 });
  }

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
