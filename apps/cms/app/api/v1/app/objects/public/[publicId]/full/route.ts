import { and, asc, eq } from 'drizzle-orm'
import { db, objectTable, iterationTable } from '@/db'
import { createR2Client, R2_BUCKET_NAME } from '@/server/clients/r2'
import { ListObjectsV2Command, type _Object } from '@aws-sdk/client-s3'
import { requireBearerToken } from '@/lib/bearerAuth'

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ publicId: string }> },
): Promise<Response> {
	try {
		requireBearerToken(req)
	} catch (error) {
		if (error instanceof Response) {
			return error
		}
		return new Response('Unauthorized', { status: 401 })
	}

	const { publicId } = await params
	if (!publicId) return new Response('Invalid publicId', { status: 400 })

	// Find the object by publicId and ensure it's public
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
		})
		.from(objectTable)
		.where(
			and(eq(objectTable.publicId, publicId), eq(objectTable.public, true)),
		)

	const objRow = objectRows[0]
	if (!objRow) return new Response('Not found', { status: 404 })

	// Type assertion with userId included
	const obj = objRow as typeof objRow & { userId: number }

	// Get iterations
	const iterations = await db
		.select()
		.from(iterationTable)
		.where(eq(iterationTable.objectId, obj.id))
		.orderBy(asc(iterationTable.createdAt))

	// Get R2 files
	const base = obj.cfR2Link || `${obj.collectionId}/${obj.userId}`

	let r2Files: Array<{
		key: string
		size: number | null
		etag: string | null
		lastModified: string | null
		url: string
	}> = []

	if (/^\d+\/\d+$/.test(base)) {
		const client = createR2Client()
		const command = new ListObjectsV2Command({
			Bucket: R2_BUCKET_NAME,
			Prefix: `${base}/`,
			MaxKeys: 1000,
		})
		const res = await client.send(command)
		const contents = (res.Contents || []) as Array<_Object>

		r2Files = contents
			.filter((o) => Boolean(o.Key))
			.map((o) => ({
				key: o.Key as string,
				size: o.Size ?? null,
				etag: o.ETag ?? null,
				lastModified: o.LastModified
					? new Date(o.LastModified).toISOString()
					: null,
				url: `https://cms.apolloview.app/api/v1/app/r2/public/object?key=${encodeURIComponent(o.Key as string)}`,
			}))
	}

	const response = {
		object: obj,
		iterations,
		r2Files,
	}

	return Response.json(response, {
		headers: {
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

