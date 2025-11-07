import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import winston from "winston";

import { db } from "@/db";
import { objectTable } from "@/db/schema";
import { validateRequest } from "@/server/auth/validate";
import { signToken } from "@/server/helper/token";
import { env } from "@/env";

const logger = winston.createLogger({
	format: winston.format.json(),
	transports: [new winston.transports.Console()],
});

function requireEditorOrAdmin(role: "ADMIN" | "EDITOR" | "USER") {
	if (role !== "ADMIN" && role !== "EDITOR") {
		throw new Error("Unauthorized: Editor or Admin required");
	}
}

export async function POST(req: NextRequest) {
	const { user } = await validateRequest();
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	requireEditorOrAdmin(user.role as any);

	const body = await req.json().catch(() => null);
	if (!body || typeof body.objectId !== "number") {
		return NextResponse.json({ error: "Invalid body: objectId required" }, { status: 400 });
	}

	const expiresInHours = typeof body.expiresInHours === "number" ? body.expiresInHours : 1;
	if (expiresInHours < 0.1 || expiresInHours > 168) {
		return NextResponse.json(
			{ error: "expiresInHours must be between 0.1 and 168" },
			{ status: 400 },
		);
	}

	const objectId = Number(body.objectId);
	const object = await db
		.select({ id: objectTable.id, publicId: objectTable.publicId, title: objectTable.title })
		.from(objectTable)
		.where(eq(objectTable.id, objectId))
		.limit(1);

	if (!object[0]) {
		return NextResponse.json({ error: "Object not found" }, { status: 404 });
	}

	const expiresAt = Date.now() + expiresInHours * 60 * 60 * 1000;
	const token = signToken({ objectId, expiresAt });
	const url = `${env.APP_PUBLIC_URL}/open?token=${encodeURIComponent(token)}`;

	logger.info("QR link created", {
		objectId,
		publicId: object[0].publicId,
		createdBy: user.id,
		expiresAt: new Date(expiresAt).toISOString(),
	});

	return NextResponse.json({ url, token, expiresAt });
}

