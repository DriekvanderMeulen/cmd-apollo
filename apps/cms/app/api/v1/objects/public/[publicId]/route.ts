import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createHash } from "crypto";

import { db } from "@/db";
import {
	collectionTable,
	objectTable,
	userTable,
	categoryTable,
	iterationTable,
} from "@/db/schema";
import { validateRequest } from "@/server/auth/validate";
import { requireBearerToken } from "@/lib/bearerAuth";
import { requireAuthContext } from "@/lib/authContext";
import { R2_BUCKET_NAME, createR2Client } from "@/server/clients/r2";

function generateETag(data: unknown): string {
	const jsonString = JSON.stringify(data)
	const hash = createHash('sha256').update(jsonString).digest('hex')
	return `"${hash}"`
}

function generateVersion(obj: {
	id: number
	title: string
	description: unknown
	iterationCount: number
}): string {
	const contentString = `${obj.id}-${obj.title}-${JSON.stringify(obj.description)}-${obj.iterationCount}`
	const hash = createHash('sha256').update(contentString).digest('hex')
	return hash.substring(0, 16)
}

async function generateSignedUrl(key: string): Promise<string | null> {
	if (!key) return null
	try {
		const client = createR2Client()
		const command = new GetObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: key,
		})
		const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 })
		return signedUrl
	} catch (error) {
		console.error('Failed to generate signed URL:', error)
		return null
	}
}

export async function GET(
	req: Request,
  { params }: { params: Promise<{ publicId: string }> },
): Promise<Response> {
	try {
		// Try bearer token first (for mobile app)
		requireBearerToken(req)
	} catch (error) {
		// If bearer token fails, try session auth (for CMS)
		try {
			await requireAuthContext(req)
		} catch (sessionError) {
			// Both auth methods failed, return error
			if (sessionError instanceof Response) {
				return sessionError
			}
			return new Response('Unauthorized', { status: 401 })
		}
	}

	const { publicId } = await params
	if (!publicId) return new Response('Invalid publicId', { status: 400 })

	// Find the object by publicId (no public check - trusts list endpoint)
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
		.where(eq(objectTable.publicId, publicId))

	const objRow = objectRows[0]
	if (!objRow) return new Response('Not found', { status: 404 })

	// Get iterations sorted by date ASC
	const iterations = await db
		.select({
			id: iterationTable.id,
			title: iterationTable.title,
			date: iterationTable.date,
			description: iterationTable.description,
		})
		.from(iterationTable)
		.where(eq(iterationTable.objectId, objRow.id))
		.orderBy(asc(iterationTable.date))

	// Generate signed URLs for poster and video
	const posterUrl = objRow.cfR2Link
		? await generateSignedUrl(objRow.cfR2Link)
		: null
	const videoUrl = objRow.videoR2Key
		? await generateSignedUrl(objRow.videoR2Key)
		: null

	// Build response
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
		version: generateVersion({
			id: objRow.id,
			title: objRow.title,
			description: objRow.description,
			iterationCount: iterations.length,
		}),
	}

	const etag = generateETag(response)

	return Response.json(response, {
		headers: {
			ETag: etag,
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Authorization, Content-Type',
		},
	})
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, {
		status: 204,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Authorization, Content-Type',
		},
	})
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { publicId } = await params;
  if (!publicId)
    return NextResponse.json({ error: "Invalid publicId" }, { status: 400 });
  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const data: any = {};
  if (typeof body.title === "string") data.title = body.title;
  if (body.description !== undefined) {
    // Handle description - accept string or object, stringify if object
    if (body.description === null) {
      data.description = null;
    } else if (typeof body.description === 'string') {
      data.description = body.description;
    } else if (typeof body.description === 'object') {
      data.description = JSON.stringify(body.description);
    }
  }
  if (typeof body.categoryId === "number" || body.categoryId === null)
    data.categoryId = body.categoryId;
  if (typeof body.collectionId === "number") {
    data.collectionId = body.collectionId;
    // keep base path consistent when collection changes
    data.cfR2Link = `${Number(body.collectionId)}/${user.id}`;
  }
  if (typeof body.cfR2Link === "string" || body.cfR2Link === null)
    data.cfR2Link = body.cfR2Link;

  await db
    .update(objectTable)
    .set(data)
    .where(
      and(eq(objectTable.publicId, publicId), eq(objectTable.userId, user.id)),
    );
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { publicId } = await params;
  if (!publicId)
    return NextResponse.json({ error: "Invalid publicId" }, { status: 400 });
  const rows = await db
    .select()
    .from(objectTable)
    .where(
      and(eq(objectTable.publicId, publicId), eq(objectTable.userId, user.id)),
    );
  const obj = rows[0];
  if (!obj) return NextResponse.json({ ok: true });
  try {
    const client = createR2Client();
    // Delete legacy single key if present
    if (obj.cfR2Link) {
      await client.send(
        new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: obj.cfR2Link }),
      );
    }
    // Delete up to 5 iteration keys under the stored base path
    const base = obj.cfR2Link || `${obj.collectionId}/${obj.userId}`;
    for (let i = 1; i <= 5; i++) {
      const key = `${base}/${i}`;
      await client.send(
        new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }),
      );
    }
  } catch {}
  await db
    .delete(objectTable)
    .where(
      and(eq(objectTable.publicId, publicId), eq(objectTable.userId, user.id)),
    );
  return NextResponse.json({ ok: true });
}
