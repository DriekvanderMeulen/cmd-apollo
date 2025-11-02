import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('cms/presign', async () => {
	const actual = await vi.importActual<typeof import('cms/presign')>('cms/presign')
	return {
		...actual,
		requestPresignedAsset: vi.fn(async () => ({ url: 'https://signed.example.com', expiresAt: Math.floor(Date.now() / 1000) + 600 }))
	}
})

import { getPresignedAsset, invalidatePresign, shouldRefresh } from '../presign'
import { requestPresignedAsset, PRESIGN_REFRESH_BUFFER_SECONDS } from 'cms/presign'

describe('mobile presign cache', () => {
	afterEach(() => {
		vi.clearAllMocks()
	})

	it('caches presigned assets until refresh window', async () => {
		const key = 'demo/video.mp4'
		process.env.EXPO_PUBLIC_R2_PRESIGN_ENDPOINT = 'https://example.com/presign'
		const first = await getPresignedAsset(key)
		const second = await getPresignedAsset(key)
		expect(first).toEqual(second)
		expect(requestPresignedAsset).toHaveBeenCalledTimes(1)
	})

	it('invalidates cache entries when requested', async () => {
		const key = 'demo/needs-refresh.mp4'
		process.env.EXPO_PUBLIC_R2_PRESIGN_ENDPOINT = 'https://example.com/presign'
		await getPresignedAsset(key)
		invalidatePresign(key)
		await getPresignedAsset(key)
		expect(requestPresignedAsset).toHaveBeenCalledTimes(2)
	})

	it('flags presigned assets that are close to expiry', () => {
		const soon = { url: 'https://signed', expiresAt: Math.floor(Date.now() / 1000) + PRESIGN_REFRESH_BUFFER_SECONDS - 10 }
		expect(shouldRefresh(soon)).toBe(true)
		const later = { url: 'https://signed', expiresAt: Math.floor(Date.now() / 1000) + 600 }
		expect(shouldRefresh(later)).toBe(false)
	})
})

