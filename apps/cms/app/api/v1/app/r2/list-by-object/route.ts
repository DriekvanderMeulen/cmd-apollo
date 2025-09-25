import { requireAuthContext } from '@/lib/authContext'
import { db } from '@/db'
import { objectTable } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { createR2Client, R2_BUCKET_NAME } from '@/server/clients/r2'
import { ListObjectsV2Command, type _Object } from '@aws-sdk/client-s3'

export async function GET(req: Request): Promise<Response> {
  await requireAuthContext(req)

  const url = new URL(req.url)
  const idRaw = url.searchParams.get('id')
  const id = Number(idRaw)
  if (!Number.isFinite(id)) return new Response('Invalid id', { status: 400 })

  const rows = await db.select().from(objectTable).where(and(eq(objectTable.id, id)))
  const obj = rows[0]
  if (!obj) return new Response('Not found', { status: 404 })

  // Build base path: prefer stored cfR2Link; otherwise fallback to collectionId/userId.
  const base = obj.cfR2Link || `${obj.collectionId}/${obj.userId}`

  // Only allow simple numeric path segments like "123/45"
  if (!/^\d+\/\d+$/.test(base)) {
    return new Response('Invalid object storage base', { status: 400 })
  }

  const client = createR2Client()
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
    Prefix: `${base}/`,
    MaxKeys: 1000,
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


