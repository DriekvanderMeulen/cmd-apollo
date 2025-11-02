import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isExternalAssetKey, requestPresignedAsset, PRESIGN_REFRESH_BUFFER_SECONDS } from '../presign'

describe('presign helpers', () => {
	const endpoint = 'https://example.com/presign'

	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn())
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('identifies external asset keys', () => {
		expect(isExternalAssetKey('https://video.example.com/v.mp4')).toBe(true)
		expect(isExternalAssetKey('http://cdn.example.com/asset.mov')).toBe(true)
		expect(isExternalAssetKey('demo/videos/clip.mp4')).toBe(false)
	})

	it('requests presigned asset without leaking raw key in logs', async () => {
		const key = 'demo/item/video.mp4'
		const mockResponse = {
			url: 'https://r2.example.com/signed',
			expiresAt: Math.floor(Date.now() / 1000) + PRESIGN_REFRESH_BUFFER_SECONDS + 90
		}
		const fetchStub = fetch as unknown as ReturnType<typeof vi.fn>
		fetchStub.mockResolvedValue({
			ok: true,
			json: async () => mockResponse
		})

		const asset = await requestPresignedAsset({ endpoint, key })

		expect(fetch).toHaveBeenCalledWith(`${endpoint}?key=${encodeURIComponent(key)}`)
		expect(asset).toEqual(mockResponse)
	})

	it('throws when fetch fails', async () => {
		const fetchStub = fetch as unknown as ReturnType<typeof vi.fn>
		fetchStub.mockResolvedValue({ ok: false, status: 500 })
		await expect(requestPresignedAsset({ endpoint, key: 'demo.mp4' })).rejects.toThrow('Presign request failed')
	})
})

