export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
	const origin = request.headers.get('origin')
	const referer = request.headers.get('referer')
	const userAgent = request.headers.get('user-agent')
	
	console.log('[ping] GET request received:', {
		origin,
		referer,
		userAgent,
		timestamp: new Date().toISOString(),
		url: request.url,
	})

	const response = Response.json(
		{
			ok: true,
			ts: Date.now(),
		},
		{
			status: 200,
			headers: {
				'cache-control': 'no-store',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
			},
		},
	)

	console.log('[ping] Response sent:', {
		status: 200,
		origin,
	})

	return response
}

export async function OPTIONS(request: Request) {
	const origin = request.headers.get('origin')
	console.log('[ping] OPTIONS preflight request:', {
		origin,
		timestamp: new Date().toISOString(),
		url: request.url,
	})

	return new Response(null, {
		status: 204,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		},
	})
}


