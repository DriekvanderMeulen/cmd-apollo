import { NextRequest, NextResponse } from "next/server";
import { and, asc, count, desc, eq, like } from "drizzle-orm";

import { db } from "@/db";
import { categoryTable, collectionTable, objectTable, userTable } from "@/db/schema";
import { validateRequest } from "@/server/auth/validate";

function requireEditorOrAdmin(role: "ADMIN" | "EDITOR" | "USER") {
	if (role !== "ADMIN" && role !== "EDITOR") {
		throw new Error("Unauthorized: Editor or Admin required");
	}
}

export async function GET(req: NextRequest) {
	const { user } = await validateRequest();
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	requireEditorOrAdmin(user.role as any);

	const { searchParams } = new URL(req.url);
	const page = Math.max(1, Number(searchParams.get("page") || 1));
	const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || 10)));
	const q = (searchParams.get("q") || "").trim();
	const sort = (searchParams.get("sort") || "id:desc").toLowerCase();

	const offset = (page - 1) * pageSize;
	const where = q ? like(objectTable.title, `%${q}%`) : undefined;

	const orderBy = sort.startsWith("title:")
		? sort.endsWith("asc")
			? asc(objectTable.title)
			: desc(objectTable.title)
		: sort.startsWith("id:")
		? sort.endsWith("asc")
			? asc(objectTable.id)
			: desc(objectTable.id)
		: desc(objectTable.id);

	const [rows, total] = await Promise.all([
		db
			.select({
				id: objectTable.id,
				publicId: objectTable.publicId,
				title: objectTable.title,
				collectionId: objectTable.collectionId,
				userId: objectTable.userId,
				public: objectTable.public,
				collectionTitle: collectionTable.title,
				authorGivenName: userTable.givenName,
				authorFamilyName: userTable.familyName,
			})
			.from(objectTable)
			.leftJoin(collectionTable, eq(objectTable.collectionId, collectionTable.id))
			.leftJoin(userTable, eq(objectTable.userId, userTable.id))
			.where(where as any)
			.orderBy(orderBy as any)
			.limit(pageSize)
			.offset(offset),
		db.select({ value: count() }).from(objectTable).where(where as any),
	]);

	return NextResponse.json({
		items: rows.map((row) => ({
			id: row.id,
			publicId: row.publicId,
			title: row.title,
			collection: row.collectionTitle || "—",
			author: row.authorGivenName || row.authorFamilyName
				? `${row.authorGivenName || ""} ${row.authorFamilyName || ""}`.trim()
				: "—",
			public: row.public,
		})),
		total: total[0]?.value || 0,
	});
}

