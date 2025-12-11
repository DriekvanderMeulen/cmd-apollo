import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { db } from "@/db";
import { iterationTable, objectTable } from "@/db/schema";
import { validateRequest } from "@/server/auth/validate";
import { R2_BUCKET, createR2Client } from "@/server/clients/r2";

function buildKey(params: {
	collectionId: number | null;
	objectId: number;
	iterationId: number;
	filename?: string | null;
}): string {
	const safeName =
		(params.filename || "image")
			.split("/")
			.pop()
			?.replace(/[^a-zA-Z0-9._-]/g, "_") || "image";
	const prefixCollection = params.collectionId ?? "uncategorized";
	const uniqueSuffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
	return `${prefixCollection}/${params.objectId}/iterations/${params.iterationId}/${uniqueSuffix}-${safeName}`;
}

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string; iterationId: string }> },
) {
	const { user } = await validateRequest();
	if (!user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id: idStr, iterationId: iterationIdStr } = await params;
	const objectId = Number(idStr);
	const iterationId = Number(iterationIdStr);

	if (!Number.isFinite(objectId) || !Number.isFinite(iterationId)) {
		return NextResponse.json({ error: "Invalid params" }, { status: 400 });
	}

	const objectRow = (
		await db
			.select()
			.from(objectTable)
			.where(and(eq(objectTable.id, objectId), eq(objectTable.userId, user.id)))
	)[0];
	if (!objectRow) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const iterationRow = (
		await db
			.select()
			.from(iterationTable)
			.where(
				and(
					eq(iterationTable.id, iterationId),
					eq(iterationTable.objectId, objectRow.id),
				),
			)
	)[0];
	if (!iterationRow) {
		return NextResponse.json({ error: "Iteration not found" }, { status: 404 });
	}

	let form: FormData;
	try {
		form = await req.formData();
	} catch {
		return NextResponse.json({ error: "Invalid form" }, { status: 400 });
	}

	const file = form.get("file") as File | null;
	if (!file) {
		return NextResponse.json({ error: "File is required" }, { status: 400 });
	}

	const key = buildKey({
		collectionId: objectRow.collectionId,
		objectId: objectRow.id,
		iterationId: iterationRow.id,
		filename: file.name,
	});

	const client = createR2Client();
	const arrayBuffer = await file.arrayBuffer();

	try {
		await client.send(
			new PutObjectCommand({
				Bucket: R2_BUCKET,
				Key: key,
				Body: Buffer.from(arrayBuffer),
				ContentType: file.type || "application/octet-stream",
			}),
		);
	} catch (error) {
		console.error("R2 PutObject failed for iteration image", {
			error,
			key,
		});
		return NextResponse.json(
			{ error: "Upload failed", detail: "R2 upload error" },
			{ status: 500 },
		);
	}

	const publicUrl = `/api/v1/app/r2/public/object?key=${encodeURIComponent(key)}`;

	return NextResponse.json({ ok: true, key, url: publicUrl });
}
