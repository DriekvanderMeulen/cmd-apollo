// app/api/app/tenants/route.ts
import { requireAuthContext } from '@/lib/authContext'
import { db, tenantTable } from '@/db'

export async function GET(req: Request): Promise<Response> {
	await requireAuthContext(req)

	const rows = await db
		.select({
			id: tenantTable.id,
			publicId: tenantTable.publicId,
			name: tenantTable.name
		})
		.from(tenantTable)
		.orderBy(tenantTable.name)

	return Response.json({ data: rows })
}
