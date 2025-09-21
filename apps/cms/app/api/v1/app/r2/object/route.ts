import { requireAuthContext } from '@/lib/authContext'
import { createR2Client, R2_BUCKET_NAME } from '@/server/clients/r2'
import { GetObjectCommand } from '@aws-sdk/client-s3'

export async function GET(req: Request): Promise<Response> {
	await requireAuthContext(req)

	const url = new URL(req.url)
	const key = url.searchParams.get('key')
	if (!key) return new Response('Missing key', { status: 400 })

	// Constrain to CollectionID/UserID prefix and block traversal
	if (!/^\d+\/\d+\/.+/.test(key) || key.includes('..')) {
		return new Response('Invalid key', { status: 400 })
	}

	const client = createR2Client()
	const res = await client.send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }))
	const body = res.Body as ReadableStream
	const contentType = (res.ContentType as string) || 'application/octet-stream'
	const contentLength = res.ContentLength ? Number(res.ContentLength) : undefined
	const etag = (res.ETag as string) || undefined

	return new Response(body as any, {
		status: 200,
		headers: {
			'content-type': contentType,
			...(contentLength ? { 'content-length': String(contentLength) } : {}),
			...(etag ? { etag } : {}),
			'cache-control': 'private, max-age=0, must-revalidate',
		},
	})
}


