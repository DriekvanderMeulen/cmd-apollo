// app/api/app/collections/route.ts
import { requireBearerToken } from "@/lib/bearerAuth";
import { db, collectionTable } from "@/db";

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
      id: collectionTable.id,
      publicId: collectionTable.publicId,
      title: collectionTable.title,
    })
    .from(collectionTable)
    .orderBy(collectionTable.title);

  return Response.json({ data: rows });
}
