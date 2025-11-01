import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { objectTable } from "@/db/schema";
import { validateRequest } from "@/server/auth";
import { ObjectDetail } from "@/components/objects/object-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { user, session } = await validateRequest();
  if (!user || !session) redirect("/login");
  const { publicId } = await params;
  if (!publicId) notFound();

  // Fetch object data to get the title
  const rows = await db
    .select()
    .from(objectTable)
    .where(
      and(eq(objectTable.publicId, publicId), eq(objectTable.userId, user.id)),
    );
  const obj = rows[0];
  if (!obj) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-900">{obj.title}</h1>
        <p className="text-neutral-600 mt-1.5 text-[15px]">
          View and edit this object.
        </p>
      </div>
      <ObjectDetail publicId={publicId} />
    </div>
  );
}
