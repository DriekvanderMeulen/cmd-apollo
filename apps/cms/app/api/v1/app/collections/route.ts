// app/api/app/collections/route.ts
import { requireAuthContext } from "@/lib/authContext";
import { db, collectionTable } from "@/db";

export async function GET(req: Request): Promise<Response> {
  await requireAuthContext(req);

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
