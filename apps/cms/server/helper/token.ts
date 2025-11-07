import { createHmac, timingSafeEqual } from 'crypto'
import { env } from '@/env'

export interface TokenPayload {
	objectId: number
	expiresAt: number
}

export function signToken(payload: TokenPayload): string {
	const secret = env.QR_TOKEN_SECRET
	const data = `${payload.objectId}:${payload.expiresAt}`
	const hmac = createHmac('sha256', secret)
	hmac.update(data)
	const signature = hmac.digest('base64url')
	return `${data}:${signature}`
}

export function verifyToken(token: string): TokenPayload | null {
	try {
		const parts = token.split(':')
		if (parts.length !== 3) {
			return null
		}

		const objectId = Number.parseInt(parts[0], 10)
		const expiresAt = Number.parseInt(parts[1], 10)
		const providedSignature = parts[2]

		if (!Number.isFinite(objectId) || !Number.isFinite(expiresAt)) {
			return null
		}

		const now = Date.now()
		if (expiresAt < now) {
			return null
		}

		const secret = env.QR_TOKEN_SECRET
		const data = `${objectId}:${expiresAt}`
		const hmac = createHmac('sha256', secret)
		hmac.update(data)
		const expectedSignature = hmac.digest('base64url')

		const expectedBuffer = Buffer.from(expectedSignature, 'base64url')
		const providedBuffer = Buffer.from(providedSignature, 'base64url')

		if (expectedBuffer.length !== providedBuffer.length) {
			return null
		}

		if (!timingSafeEqual(expectedBuffer, providedBuffer)) {
			return null
		}

		return { objectId, expiresAt }
	} catch {
		return null
	}
}

