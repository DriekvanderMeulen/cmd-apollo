import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { listR2, getR2ObjectBlob, type R2ObjectSummary } from '@/lib/api'

export type CachedR2Item = {
	key: string
	blob: Blob
	contentType: string
}

type R2CacheContextValue = {
	getCachedKeys(prefix: string): Array<string>
	getCachedItem(key: string): CachedR2Item | null
	ensurePrefix(prefix: string): Promise<Array<R2ObjectSummary>>
	downloadKey(key: string): Promise<CachedR2Item>
}

const R2CacheContext = createContext<R2CacheContextValue | null>(null)

export function useR2Cache(): R2CacheContextValue {
	const ctx = useContext(R2CacheContext)
	if (!ctx) throw new Error('R2CacheProvider missing')
	return ctx
}

export function R2CacheProvider({ children }: { children: React.ReactNode }) {
	const [prefixToKeys, setPrefixToKeys] = useState<Map<string, Array<R2ObjectSummary>>>(new Map())
	const keyToBlobRef = useRef(new Map<string, CachedR2Item>())

	const getCachedKeys = useCallback((prefix: string): Array<string> => {
		const list = prefixToKeys.get(prefix) || []
		return list.map((i) => i.key)
	}, [prefixToKeys])

	const getCachedItem = useCallback((key: string): CachedR2Item | null => {
		return keyToBlobRef.current.get(key) || null
	}, [])

	const ensurePrefix = useCallback(async (prefix: string): Promise<Array<R2ObjectSummary>> => {
		if (prefixToKeys.has(prefix)) return prefixToKeys.get(prefix) as Array<R2ObjectSummary>
		const list = await listR2(prefix)
		setPrefixToKeys((prev) => new Map(prev).set(prefix, list))
		return list
	}, [prefixToKeys])

	const downloadKey = useCallback(async (key: string): Promise<CachedR2Item> => {
		const existing = keyToBlobRef.current.get(key)
		if (existing) return existing
		const blob = await getR2ObjectBlob(key)
		const item: CachedR2Item = { key, blob, contentType: (blob as any).type || 'application/octet-stream' }
		keyToBlobRef.current.set(key, item)
		return item
	}, [])

	const value = useMemo<R2CacheContextValue>(() => ({
		getCachedKeys,
		getCachedItem,
		ensurePrefix,
		downloadKey,
	}), [getCachedKeys, getCachedItem, ensurePrefix, downloadKey])

	return <R2CacheContext.Provider value={value}>{children}</R2CacheContext.Provider>
}


