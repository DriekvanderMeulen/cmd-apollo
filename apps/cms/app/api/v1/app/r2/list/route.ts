import { requireAuthContext } from '@/lib/authContext'
import { createR2Client, R2_BUCKET_NAME } from '@/server/clients/r2'
import { ListObjectsV2Command, type _Object } from '@aws-sdk/client-s3'

export async function GET(req: Request): Promise<Response> {
	await requireAuthContext(req)

	const url = new URL(req.url)
	const prefix = url.searchParams.get('prefix') || ''

	// Only allow simple numeric path segments like "123/45" to avoid traversal
	if (!/^\d+\/\d+$/.test(prefix)) {
		return new Response('Invalid prefix', { status: 400 })
	}

	const client = createR2Client()
	const command = new ListObjectsV2Command({
		Bucket: R2_BUCKET_NAME,
		Prefix: `${prefix}/`,
		MaxKeys: 10,
	})
	const res = await client.send(command)
	const contents = (res.Contents || []) as Array<_Object>

	const data = contents
		.filter((o) => Boolean(o.Key))
		.map((o) => ({
			key: o.Key as string,
			size: o.Size ?? null,
			etag: o.ETag ?? null,
			lastModified: o.LastModified ? new Date(o.LastModified).toISOString() : null,
		}))

	return Response.json({ data })
}


