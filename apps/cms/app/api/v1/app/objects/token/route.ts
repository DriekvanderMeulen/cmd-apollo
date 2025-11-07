import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import winston from "winston";

import { db } from "@/db";
import {
	collectionTable,
	objectTable,
	userTable,
	categoryTable,
	iterationTable,
} from "@/db/schema";
import { requireBearerToken } from "@/lib/bearerAuth";
import { verifyToken } from "@/server/helper/token";
import { R2_BUCKET_NAME, createR2Client } from "@/server/clients/r2";

const logger = winston.createLogger({
	format: winston.format.json(),
	transports: [new winston.transports.Console()],
});

// Simple in-memory rate limiting (for MVP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute per IP

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const record = rateLimitMap.get(ip);

	if (!record || record.resetAt < now) {
		rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
		return true;
	}

	if (record.count >= RATE_LIMIT_MAX) {
		return false;
	}

	record.count++;
	return true;
}

async function generateSignedUrl(key: string): Promise<string | null> {
	if (!key) return null;
	try {
		const client = createR2Client();
		const command = new GetObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: key,
		});
		const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
		return signedUrl;
	} catch (error) {
		console.error("Failed to generate signed URL:", error);
		return null;
	}
}

export async function GET(req: NextRequest): Promise<Response> {
	try {
		requireBearerToken(req);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(req.url);
	const token = searchParams.get("token");

	if (!token) {
		return NextResponse.json({ error: "Missing token" }, { status: 400 });
	}

	// Rate limiting
	const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
	if (!checkRateLimit(ip)) {
		logger.warn("Rate limit exceeded", { ip });
		return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
	}

	// Verify token
	const payload = verifyToken(token);
	if (!payload) {
		logger.warn("Invalid token", { ip });
		return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
	}

	// Fetch object
	const objectRows = await db
		.select({
			id: objectTable.id,
			publicId: objectTable.publicId,
			title: objectTable.title,
			description: objectTable.description,
			collectionId: objectTable.collectionId,
			categoryId: objectTable.categoryId,
			cfR2Link: objectTable.cfR2Link,
			videoR2Key: objectTable.videoR2Key,
			userId: objectTable.userId,
			userPublicId: userTable.publicId,
			userGivenName: userTable.givenName,
			userFamilyName: userTable.familyName,
			userEmail: userTable.email,
			collectionTitle: collectionTable.title,
			collectionPublicId: collectionTable.publicId,
			categoryTitle: categoryTable.title,
			categoryPublicId: categoryTable.publicId,
		})
		.from(objectTable)
		.leftJoin(userTable, eq(userTable.id, objectTable.userId))
		.leftJoin(collectionTable, eq(collectionTable.id, objectTable.collectionId))
		.leftJoin(categoryTable, eq(categoryTable.id, objectTable.categoryId))
		.where(eq(objectTable.id, payload.objectId))
		.limit(1);

	const objRow = objectRows[0];
	if (!objRow) {
		logger.warn("Object not found for token", { objectId: payload.objectId, ip });
		return NextResponse.json({ error: "Object not found" }, { status: 404 });
	}

	// Get iterations
	const iterations = await db
		.select({
			id: iterationTable.id,
			title: iterationTable.title,
			date: iterationTable.date,
			description: iterationTable.description,
		})
		.from(iterationTable)
		.where(eq(iterationTable.objectId, objRow.id))
		.orderBy(asc(iterationTable.date));

	// Generate signed URLs
	const posterUrl = objRow.cfR2Link ? await generateSignedUrl(objRow.cfR2Link) : null;
	const videoUrl = objRow.videoR2Key ? await generateSignedUrl(objRow.videoR2Key) : null;

	// Log successful view
	logger.info("QR token view", {
		objectId: payload.objectId,
		publicId: objRow.publicId,
		ip,
	});

	// Return only fields needed for viewing
	const response = {
		publicId: objRow.publicId,
		title: objRow.title,
		description: objRow.description,
		user: {
			id: objRow.userId,
			publicId: objRow.userPublicId,
			givenName: objRow.userGivenName,
			familyName: objRow.userFamilyName,
			email: objRow.userEmail,
		},
		collection: {
			id: objRow.collectionId,
			publicId: objRow.collectionPublicId,
			title: objRow.collectionTitle,
		},
		category: objRow.categoryId
			? {
					id: objRow.categoryId,
					publicId: objRow.categoryPublicId,
					title: objRow.categoryTitle,
				}
			: null,
		posterUrl,
		videoUrl,
		iterations,
	};

	return NextResponse.json(response, {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Authorization, Content-Type",
		},
	});
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Authorization, Content-Type",
		},
	});
}

