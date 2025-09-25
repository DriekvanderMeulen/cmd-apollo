import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { listR2, listR2ByObject, getR2ObjectBlob, type R2ObjectSummary } from '@/lib/api'

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
    // New: cache size and management APIs
    getCachedSizeForKey(key: string): number
    getCachedSizeForPrefix(prefix: string): number
    getExpectedSizeForPrefix(prefix: string): number
    getTotalCachedSize(): number
    isPrefixFullyCached(prefix: string): boolean
    clearPrefix(prefix: string): void
    clearAll(): void
    // ObjectId-based helpers
    ensureObject(objectId: number): Promise<Array<R2ObjectSummary>>
    getCachedSizeForObject(objectId: number): number
    getExpectedSizeForObject(objectId: number): number
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
    const [version, setVersion] = useState(0)

    function normalizePrefix(prefix: string): string {
        if (!prefix) return prefix
        // Server expects no trailing slash in the query param. Canonicalize to no slash.
        return prefix.endsWith('/') ? prefix.slice(0, -1) : prefix
    }

    const getCachedKeys = useCallback((prefix: string): Array<string> => {
        const list = prefixToKeys.get(normalizePrefix(prefix)) || []
		return list.map((i) => i.key)
    }, [prefixToKeys])

	const getCachedItem = useCallback((key: string): CachedR2Item | null => {
		return keyToBlobRef.current.get(key) || null
	}, [])

    const ensurePrefix = useCallback(async (prefix: string): Promise<Array<R2ObjectSummary>> => {
        const p = normalizePrefix(prefix)
        if (prefixToKeys.has(p)) return prefixToKeys.get(p) as Array<R2ObjectSummary>
        const list = await listR2(p)
        setPrefixToKeys((prev) => new Map(prev).set(p, list))
		return list
	}, [prefixToKeys])

    const ensureObject = useCallback(async (objectId: number): Promise<Array<R2ObjectSummary>> => {
        const list = await listR2ByObject(objectId)
        const firstKey = list[0]?.key || null
        if (firstKey) {
            const parts = firstKey.split('/')
            if (parts.length >= 2) {
                const base = `${parts[0]}/${parts[1]}`
                setPrefixToKeys((prev) => new Map(prev).set(base, list))
            }
        }
        return list
    }, [])

	const downloadKey = useCallback(async (key: string): Promise<CachedR2Item> => {
		const existing = keyToBlobRef.current.get(key)
		if (existing) return existing
        console.log('[r2] download start', { key })
		const blob = await getR2ObjectBlob(key)
		const item: CachedR2Item = { key, blob, contentType: (blob as any).type || 'application/octet-stream' }
		keyToBlobRef.current.set(key, item)
        setVersion((v) => v + 1)
        console.log('[r2] download done', { key, size: blob.size, type: (blob as any).type })
		return item
	}, [])

    const getCachedSizeForKey = useCallback((key: string): number => {
        const item = keyToBlobRef.current.get(key)
        return item?.blob?.size ?? 0
    }, [])

    const getCachedSizeForPrefix = useCallback((prefix: string): number => {
        const list = prefixToKeys.get(normalizePrefix(prefix)) || []
        return list.reduce((acc, entry) => acc + (keyToBlobRef.current.get(entry.key)?.blob?.size ?? 0), 0)
    }, [prefixToKeys])

    const getExpectedSizeForPrefix = useCallback((prefix: string): number => {
        const list = prefixToKeys.get(normalizePrefix(prefix)) || []
        return list.reduce((acc, entry) => acc + (entry.size ?? 0), 0)
    }, [prefixToKeys])

    const getTotalCachedSize = useCallback((): number => {
        let total = 0
        keyToBlobRef.current.forEach((item) => { total += item.blob?.size ?? 0 })
        return total
    }, [])

    const getCachedSizeForObject = useCallback((objectId: number): number => {
        // After ensureObject, sizes are indexed by the derived base; sum sizes for those entries
        let total = 0
        prefixToKeys.forEach((list) => {
            total += list.reduce((acc, entry) => acc + (keyToBlobRef.current.get(entry.key)?.blob?.size ?? 0), 0)
        })
        return total
    }, [prefixToKeys])

    const getExpectedSizeForObject = useCallback((objectId: number): number => {
        let total = 0
        prefixToKeys.forEach((list) => {
            total += list.reduce((acc, entry) => acc + (entry.size ?? 0), 0)
        })
        return total
    }, [prefixToKeys])

    const isPrefixFullyCached = useCallback((prefix: string): boolean => {
        const list = prefixToKeys.get(normalizePrefix(prefix)) || []
        if (list.length === 0) return false
        return list.every((entry) => keyToBlobRef.current.has(entry.key))
    }, [prefixToKeys])

    const clearPrefix = useCallback((prefix: string): void => {
        const list = prefixToKeys.get(normalizePrefix(prefix)) || []
        let removed = false
        list.forEach((entry) => {
            if (keyToBlobRef.current.delete(entry.key)) removed = true
        })
        if (removed) setVersion((v) => v + 1)
    }, [prefixToKeys])

    const clearAll = useCallback((): void => {
        if (keyToBlobRef.current.size === 0) return
        keyToBlobRef.current = new Map()
        setVersion((v) => v + 1)
    }, [])

    const value = useMemo<R2CacheContextValue>(() => ({
		getCachedKeys,
		getCachedItem,
		ensurePrefix,
		downloadKey,
        getCachedSizeForKey,
        getCachedSizeForPrefix,
        getExpectedSizeForPrefix,
        getTotalCachedSize,
        isPrefixFullyCached,
        clearPrefix,
        clearAll,
        ensureObject,
        getCachedSizeForObject,
        getExpectedSizeForObject,
    }), [getCachedKeys, getCachedItem, ensurePrefix, downloadKey, getCachedSizeForKey, getCachedSizeForPrefix, getExpectedSizeForPrefix, getTotalCachedSize, isPrefixFullyCached, clearPrefix, clearAll, ensureObject, getCachedSizeForObject, getExpectedSizeForObject, version])

	return <R2CacheContext.Provider value={value}>{children}</R2CacheContext.Provider>
}


