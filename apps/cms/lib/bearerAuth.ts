import { env } from '@/env'

export function validateBearerToken(req: Request): boolean {
	const authHeader = req.headers.get('authorization') || ''
	const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

	if (!token) {
		return false
	}

	return token === env.APP_BEARER_TOKEN
}

export function requireBearerToken(req: Request): void {
	if (!validateBearerToken(req)) {
		throw new Response('Unauthorized', { status: 401 })
	}
}

