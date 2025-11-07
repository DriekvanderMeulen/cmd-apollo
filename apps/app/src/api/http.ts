import Constants from 'expo-constants'
import { CMS_API_URL } from '@/constants/config'

type JsonValue = unknown

function resolveBaseUrl(): string {
	const fromEnv = process.env.EXPO_PUBLIC_CMS_URL
	const fromExtra = (Constants.expoConfig as any)?.extra?.cmsUrl as string | undefined
	const baseUrl = fromEnv || fromExtra || CMS_API_URL
	console.log('[http.ts] resolveBaseUrl:', {
		fromEnv,
		fromExtra,
		fallback: CMS_API_URL,
		baseUrl,
		constants: Constants.expoConfig?.extra,
	})
	if (!baseUrl) throw new Error('Missing EXPO_PUBLIC_CMS_URL (or app.config extra cmsUrl)')
	return baseUrl.replace(/\/$/, '')
}

function resolveReadToken(): string | undefined {
	const fromEnv = process.env.EXPO_PUBLIC_CMS_READ_TOKEN
	const fromExtra = (Constants.expoConfig as any)?.extra?.cmsReadToken as string | undefined
	return fromEnv || fromExtra
}

export async function get(path: string, init?: RequestInit): Promise<JsonValue> {
	const baseUrl = resolveBaseUrl()
	const url = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
	const token = resolveReadToken()
	const headers: Record<string, string> = {
		Accept: 'application/json',
		...(init?.headers as Record<string, string>),
	}
	if (token) headers.Authorization = `Bearer ${token}`

	console.log('[http.ts] GET request:', {
		url,
		path,
		baseUrl,
		hasToken: !!token,
		headers: Object.keys(headers),
	})

	try {
		const response = await fetch(url, { ...init, method: 'GET', headers })
		console.log('[http.ts] Response:', {
			url,
			status: response.status,
			statusText: response.statusText,
			ok: response.ok,
			headers: Object.fromEntries(response.headers.entries()),
		})
		if (!response.ok) {
			const bodyText = await response.text().catch(() => '')
			console.error('[http.ts] Request failed:', {
				url,
				status: response.status,
				statusText: response.statusText,
				bodyText,
			})
			throw new Error(`GET ${url} failed: ${response.status} ${response.statusText} ${bodyText}`)
		}
		const contentType = response.headers.get('content-type') || ''
		if (contentType.includes('application/json')) return response.json()
		return response.text()
	} catch (error) {
		console.error('[http.ts] Fetch error:', {
			url,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		})
		throw error
	}
}

export const api = { get }
