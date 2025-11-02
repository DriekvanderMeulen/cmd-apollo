import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Item, Iteration } from 'cms/types'
import { fetchItemByIdentifier } from '../services/cms'
import { cacheItem, loadLastItemId, readCachedItemById, readCachedItemBySlug, storeLastItemId } from '../services/storage'
import { getPresignedAsset, invalidatePresign } from '../services/presign'
import { isExternalAssetKey } from 'cms/presign'
import { logAnalyticsEvent } from '../services/analytics'

type ViewerStatus = 'loading' | 'video' | 'details' | 'error'

interface UseItemArgs {
	id?: string
	slug?: string
}

interface UseItemResult {
	status: ViewerStatus
	item: Item | null
	iteration: Iteration | null
	videoUri: string | null
	posterUri: string | null
	showDetails: boolean
	hasNext: boolean
	hasPrevious: boolean
	isEmpty: boolean
	errorMessage: string | null
	onVideoEnd(durationSeconds?: number): void
	onSwipeDown(): void
	onVideoError(): void
	goToNext(): void
	goToPrevious(): void
	retry(): void
}

interface ResolvedIdentifier {
	origin: 'deep-link' | 'history'
	id?: string
	slug?: string
}

const EMPTY_ERROR = 'Scan a QR code to open an Apollo item.'
const MEDIA_ERROR = 'Unable to load media for this iteration. Retry when you are back online.'
const LOAD_ERROR = 'We could not load this item. Check your connection and try again.'

export function useItem(args: UseItemArgs): UseItemResult {
	const [status, setStatus] = useState<ViewerStatus>('loading')
	const [item, setItem] = useState<Item | null>(null)
	const [iterationIndex, setIterationIndex] = useState<number>(0)
	const [videoUri, setVideoUri] = useState<string | null>(null)
	const [posterUri, setPosterUri] = useState<string | null>(null)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)
	const videoKeyRef = useRef<string | null>(null)
	const iterationViewRef = useRef<string | null>(null)
	const identifierDeps = useMemo(
		() => ({ id: args.id, slug: args.slug ?? args.id }),
		[args.id, args.slug]
	)

	const iteration = item ? item.iterations[iterationIndex] ?? null : null
	const hasIterations = Boolean(item && item.iterations.length > 0)
	const hasNext = Boolean(item && item.iterations[iterationIndex + 1])
	const hasPrevious = iterationIndex > 0
	const showDetails = status === 'details' || !iteration?.videoKey

	const loadItem = useCallback(async () => {
		setStatus('loading')
		setErrorMessage(null)
		clearRefreshTimer()
		videoKeyRef.current = null

		const resolved = await resolveIdentifier(identifierDeps)
		if (!resolved) {
			setItem(null)
			setErrorMessage(EMPTY_ERROR)
			setStatus('error')
			return
		}

		try {
			const fetched = await fetchItemByIdentifier(resolved)
			setItem(fetched)
			setIterationIndex(0)
			await Promise.all([cacheItem(fetched), storeLastItemId(fetched.id)])
			logAnalyticsEvent({ type: 'item_open', itemId: fetched.id, origin: resolved.origin })
			if (!fetched.iterations.length) {
				setStatus('details')
				return
			}
			setStatus(fetched.iterations[0].videoKey ? 'video' : 'details')
		} catch (error) {
			console.warn('Failed to fetch CMS item', error)
			const cached = await loadCachedFallback(resolved)
			if (cached) {
				setItem(cached)
				setIterationIndex(0)
				setErrorMessage('Offline mode. Showing last saved copy.')
				setStatus('details')
				logAnalyticsEvent({ type: 'item_open', itemId: cached.id, origin: resolved.origin })
				return
			}
			setItem(null)
			setErrorMessage(LOAD_ERROR)
			setStatus('error')
		}
	}, [identifierDeps])

	useEffect(() => {
		loadItem().catch((error) => {
			console.warn('Unexpected error loading item', error)
			setErrorMessage(LOAD_ERROR)
			setStatus('error')
		})
	}, [loadItem])

	useEffect(() => {
		return () => {
			clearRefreshTimer()
		}
	}, [])

	useEffect(() => {
		if (!item) {
			setVideoUri(null)
			setPosterUri(null)
			return
		}

		if (!item.iterations.length) {
			setVideoUri(null)
			setPosterUri(null)
			return
		}

		const target = item.iterations[iterationIndex] ?? item.iterations[0]
		let cancelled = false

		async function hydrateMedia(): Promise<void> {
			try {
				const [videoAsset, posterAsset] = await Promise.all([
					resolveAsset(target.videoKey),
					resolveAsset(target.posterKey)
				])
				if (cancelled) {
					return
				}
				videoKeyRef.current = target.videoKey ?? null
				setVideoUri(videoAsset?.url ?? null)
				setPosterUri(posterAsset?.url ?? null)
				if (target.videoKey && videoAsset?.url) {
					scheduleRefresh(target.videoKey, videoAsset.expiresAt)
					setStatus((current) => (current === 'loading' || current === 'video' ? 'video' : current))
				} else {
					clearRefreshTimer()
					setStatus('details')
				}
			} catch (error) {
				console.warn('Unable to prepare media', error)
				if (!cancelled) {
					setErrorMessage(MEDIA_ERROR)
					setStatus('error')
				}
			}
		}

		hydrateMedia()
		return () => {
			cancelled = true
		}
	}, [item, iterationIndex])

	useEffect(() => {
		if (!item) {
			return
		}
		const current = item.iterations[iterationIndex]
		if (!current) {
			return
		}
		if (iterationViewRef.current === current.id) {
			return
		}
		iterationViewRef.current = current.id
		logAnalyticsEvent({ type: 'iteration_view', itemId: item.id, iterationId: current.id, order: current.order })
	}, [item, iterationIndex])

	const onVideoEnd = useCallback((durationSeconds = 0) => {
		if (!item || !iteration) {
			return
		}
		setStatus('details')
		logAnalyticsEvent({ type: 'video_ended', itemId: item.id, iterationId: iteration.id, durationSeconds })
	}, [item, iteration])

	const onSwipeDown = useCallback(() => {
		setStatus('details')
	}, [])

	const onVideoError = useCallback(() => {
		setErrorMessage(MEDIA_ERROR)
		setStatus('error')
	}, [])

	const goToNext = useCallback(() => {
		if (!item || !item.iterations[iterationIndex + 1]) {
			return
		}
		setStatus('loading')
		setIterationIndex((value) => value + 1)
	}, [item, iterationIndex])

	const goToPrevious = useCallback(() => {
		if (iterationIndex === 0) {
			return
		}
		setStatus('loading')
		setIterationIndex((value) => value - 1)
	}, [iterationIndex])

	const retry = useCallback(() => {
		loadItem().catch((error) => {
			console.warn('Retry failed', error)
			setErrorMessage(LOAD_ERROR)
			setStatus('error')
		})
	}, [loadItem])

	return {
		status,
		item,
		iteration,
		videoUri,
		posterUri,
		showDetails,
		hasNext,
		hasPrevious,
		isEmpty: !hasIterations,
		errorMessage,
		onVideoEnd,
		onSwipeDown,
		onVideoError,
		goToNext,
		goToPrevious,
		retry
	}

	async function resolveAsset(key: string | null | undefined): Promise<PresignedResult | null> {
		if (!key) {
			return null
		}
		if (isExternalAssetKey(key)) {
			return { url: key, expiresAt: Math.floor(Date.now() / 1000) + 86400 }
		}
		const asset = await getPresignedAsset(key)
		return asset
	}

	function scheduleRefresh(key: string, expiresAt: number): void {
		if (isExternalAssetKey(key)) {
			return
		}
		clearRefreshTimer()
		const now = Math.floor(Date.now() / 1000)
		const delayMs = Math.max((expiresAt - 60 - now) * 1000, 0)
		if (delayMs <= 0) {
			return
		}
		refreshTimerRef.current = setTimeout(async () => {
			if (videoKeyRef.current !== key) {
				return
			}
			try {
				const refreshed = await getPresignedAsset(key)
				if (videoKeyRef.current !== key) {
					return
				}
				setVideoUri(refreshed.url)
				scheduleRefresh(key, refreshed.expiresAt)
			} catch (error) {
				console.warn('Failed to refresh presigned URL', error)
				invalidatePresign(key)
			}
		}, delayMs)
	}

	function clearRefreshTimer(): void {
		if (refreshTimerRef.current) {
			clearTimeout(refreshTimerRef.current)
			refreshTimerRef.current = null
		}
	}
}

async function resolveIdentifier(identifier: ResolvedIdentifier | { id?: string; slug?: string }): Promise<ResolvedIdentifier | null> {
	if (identifier.id || identifier.slug) {
		return {
			id: identifier.id,
			slug: identifier.slug,
			origin: 'deep-link'
		}
	}
	const lastId = await loadLastItemId()
	if (lastId) {
		return {
			id: lastId,
			origin: 'history'
		}
	}
	return null
}

async function loadCachedFallback(resolved: ResolvedIdentifier): Promise<Item | null> {
	if (resolved.id) {
		return readCachedItemById(resolved.id)
	}
	if (resolved.slug) {
		return readCachedItemBySlug(resolved.slug)
	}
	return null
}

interface PresignedResult {
	url: string
	expiresAt: number
}

