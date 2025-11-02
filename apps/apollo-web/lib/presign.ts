import { isExternalAssetKey, PRESIGN_REFRESH_BUFFER_SECONDS, requestPresignedAsset, type PresignedAsset } from 'cms/presign'

const cacheStore = new Map<string, PresignedAsset>()

export async function getPresignedUrl(key: string | null): Promise<PresignedAsset | null> {
	if (!key) {
		return null
	}
	if (isExternalAssetKey(key)) {
		return { url: key, expiresAt: Math.floor(Date.now() / 1000) + 86400 }
	}
	const cached = cacheStore.get(key)
	if (cached && cached.expiresAt - PRESIGN_REFRESH_BUFFER_SECONDS > Math.floor(Date.now() / 1000)) {
		return cached
	}
	const endpoint = process.env.R2_PRESIGN_ENDPOINT ?? process.env.NEXT_PUBLIC_R2_PRESIGN_ENDPOINT
	if (!endpoint) {
		throw new Error('Missing R2 presign endpoint configuration')
	}
	const asset = await requestPresignedAsset({ endpoint, key })
	cacheStore.set(key, asset)
	return asset
}

