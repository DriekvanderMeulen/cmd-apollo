import { and, eq } from "drizzle-orm";
import { db, objectTable } from "@/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ publicId: string }> },
): Promise<Response> {
  const { publicId } = await params;
  if (!publicId) return new Response("Invalid publicId", { status: 400 });

  // Find the object by publicId and ensure it's public
  const rows = await db
    .select({
      id: objectTable.id,
      publicId: objectTable.publicId,
      title: objectTable.title,
      description: objectTable.description,
      collectionId: objectTable.collectionId,
      categoryId: objectTable.categoryId,
      cfR2Link: objectTable.cfR2Link,
    })
    .from(objectTable)
    .where(
      and(eq(objectTable.publicId, publicId), eq(objectTable.public, true)),
    );

  const obj = rows[0];
  if (!obj) return new Response("Not found", { status: 404 });

  return Response.json(obj);
}
