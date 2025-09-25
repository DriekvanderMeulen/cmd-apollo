import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, ListRenderItemInfo, RefreshControl, View, Text, Alert } from 'react-native'
import { useR2Cache } from '@/components/r2-cache-provider'
import { SafeAreaView } from 'react-native-safe-area-context'

import FiltersBar from '@/components/library/filters-bar'
import ObjectCard from '@/components/library/object-card'
import { fetchObjects, fetchCategories, fetchCollections, fetchTenants, type AppObject, type Category, type Collection, type Tenant } from '@/lib/api'

export default function LibraryScreen() {
	const [objects, setObjects] = useState<Array<AppObject>>([])
	const [cursor, setCursor] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [isRefreshing, setIsRefreshing] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [tenants, setTenants] = useState<Array<Tenant>>([])
	const [categories, setCategories] = useState<Array<Category>>([])
	const [collections, setCollections] = useState<Array<Collection>>([])

	// Availability of filter options given current other selections
	const [enabledCategoryIds, setEnabledCategoryIds] = useState<Set<number>>(new Set())
	const [enabledCollectionIds, setEnabledCollectionIds] = useState<Set<number>>(new Set())

	const [search, setSearch] = useState('')
	const [tenantId, setTenantId] = useState<number | null>(null)
	const [categoryId, setCategoryId] = useState<number | null>(null)
	const [collectionId, setCollectionId] = useState<number | null>(null)
	const [sort, setSort] = useState<'title' | 'updated'>('updated')
const [downloadingPrefixes, setDownloadingPrefixes] = useState<Set<string>>(new Set())
const { ensurePrefix, ensureObject, downloadKey, getCachedSizeForPrefix, getExpectedSizeForPrefix, isPrefixFullyCached, clearPrefix } = useR2Cache()

function formatBytes(bytes: number): string {
    if (!bytes || bytes <= 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let idx = 0
    let value = bytes
    while (value >= 1000 && idx < units.length - 1) {
        value = value / 1000
        idx++
    }
    // If in MB (idx===2) and >= 1000 MB, we will go to GB naturally via loop. The example 3400MB -> 3.4GB is covered.
    const fixed = value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(1)
    return `${Number(fixed)} ${units[idx]}`
}

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				const [t, c, co] = await Promise.all([
					fetchTenants(),
					fetchCategories(),
					fetchCollections(),
				])
				if (cancelled) return
				setTenants(t)
				setCategories(c)
				setCollections(co)
			} catch (e) {
				if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load filters')
			}
		})()
		return () => {
			cancelled = true
		}
	}, [])

	const tenantOptions = useMemo(() => tenants.map((t) => ({ id: t.id, label: t.title ?? t.name ?? `Tenant ${t.id}` })), [tenants])
	const categoryOptions = useMemo(() => categories.map((c) => ({ id: c.id, label: c.title })), [categories])
	const collectionOptions = useMemo(() => collections.map((c) => ({ id: c.id, label: c.title })), [collections])

	// Compute which category/collection options would yield at least 1 object
	const refreshAvailability = useCallback(async () => {
		try {
			const [catRes, colRes] = await Promise.all([
				Promise.all(
					categoryOptions.map((opt) =>
						fetchObjects({ categoryId: opt.id, collectionId, search, limit: 1, tenantId })
					)
				),
				Promise.all(
					collectionOptions.map((opt) =>
						fetchObjects({ categoryId, collectionId: opt.id, search, limit: 1, tenantId })
					)
				),
			])
			setEnabledCategoryIds(
				new Set(
					categoryOptions
						.filter((_, i) => (catRes[i]?.data?.length ?? 0) > 0)
						.map((o) => o.id)
				)
			)
			setEnabledCollectionIds(
				new Set(
					collectionOptions
						.filter((_, i) => (colRes[i]?.data?.length ?? 0) > 0)
						.map((o) => o.id)
				)
			)
		} catch {
			// ignore availability failure; keep previous availability
		}
	}, [categoryOptions, collectionOptions, categoryId, collectionId, search, tenantId])

	useEffect(() => {
		if (categoryOptions.length > 0 || collectionOptions.length > 0) {
			refreshAvailability()
		}
	}, [refreshAvailability])

	// Ensure selected values remain valid
	useEffect(() => {
		if (categoryId !== null && enabledCategoryIds.size > 0 && !enabledCategoryIds.has(categoryId)) {
			setCategoryId(null)
		}
		if (collectionId !== null && enabledCollectionIds.size > 0 && !enabledCollectionIds.has(collectionId)) {
			setCollectionId(null)
		}
	}, [enabledCategoryIds, enabledCollectionIds, categoryId, collectionId])

	const loadPage = useCallback(async (opts?: { reset?: boolean }) => {
		if (isLoading) return
		setIsLoading(true)
		setError(null)
		try {
			const qCursor = opts?.reset ? null : cursor
			const { data, nextCursor } = await fetchObjects({
				categoryId,
				collectionId,
				search,
				cursor: qCursor ?? undefined,
				limit: 50,
				// tenantId is speculative; harmless if ignored by server
				tenantId,
			})
			setCursor(nextCursor ?? null)
			setObjects((prev) => (opts?.reset ? data : [...prev, ...data]))
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to load objects')
		} finally {
			setIsLoading(false)
		}
	}, [categoryId, collectionId, search, cursor, tenantId, isLoading])

	useEffect(() => {
		// Reset list when filters/search change
		setObjects([])
		setCursor(null)
		loadPage({ reset: true })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search, tenantId, categoryId, collectionId])

	const onRefresh = useCallback(async () => {
		setIsRefreshing(true)
		setObjects([])
		setCursor(null)
		await loadPage({ reset: true })
		setIsRefreshing(false)
	}, [loadPage])

	// While any downloads are active, update the list every second so sizes progress
	useEffect(() => {
		if (downloadingPrefixes.size === 0) return
		const id = setInterval(() => {
			// Trigger rerender by toggling a dummy state via setState callback
			setObjects((prev) => [...prev])
		}, 1000)
		return () => clearInterval(id)
	}, [downloadingPrefixes])

	const filteredAndSortedObjects = useMemo(() => {
		let arr = [...objects]
		// Client-side filter fallback for tenant if backend doesn't filter
		if (tenantId !== null) arr = arr.filter((o) => (o.tenantId ?? tenantId) === tenantId)
		if (sort === 'title') {
			arr.sort((a, b) => a.title.localeCompare(b.title))
		} else {
			arr.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
		}
		return arr
	}, [objects, sort, tenantId])

	function renderItem({ item }: ListRenderItemInfo<AppObject>) {
		const tenantLabel = (() => {
			const id = item.tenantId ?? tenantId
			if (id === null || id === undefined) return 'Tenant'
			return tenantOptions.find((t) => t.id === id)?.label || 'Tenant'
		})()
		const categoryLabel = categoryOptions.find((c) => c.id === item.categoryId)?.label
		const collectionLabel = collectionOptions.find((c) => c.id === item.collectionId)?.label
		const username = item.username || null
		const onPress = async () => {
			const original = item.cfR2Link || null
			const prefix = original
			if (!prefix) return
			if (downloadingPrefixes.has(prefix)) return
			console.log('[library] start download', { prefix, title: item.title, publicId: item.publicId })
			setDownloadingPrefixes((prev) => new Set(prev).add(prefix))
			try {
				// Prefer object-id based listing for reliability
				let list = await ensureObject(item.id)
				console.log('[library] listed prefix', { prefix, count: list.length })
				if (list.length === 0 && prefix && !prefix.endsWith('/')) {
					const alt = `${prefix}/`
					console.log('[library] retry listing with trailing slash', { alt })
					list = await ensurePrefix(alt)
					console.log('[library] listed prefix (retry)', { alt, count: list.length })
				}
				if (list.length === 0) {
					console.warn('[library] no objects found for prefix', { prefix })
					return
				}
				await Promise.all(
					list.map(async (entry, idx) => {
						if (!entry.key) return
						console.log('[library] download key start', { idx: idx + 1, total: list.length, key: entry.key, size: entry.size })
						try {
							await downloadKey(entry.key)
							console.log('[library] download key done', { key: entry.key })
						} catch (err) {
							console.error('[library] download key failed', { key: entry.key, error: err instanceof Error ? err.message : String(err) })
							throw err
						}
					})
				)
			} catch (e) {
				console.error('[library] prefix download failed', { prefix, error: e instanceof Error ? e.message : String(e) })
			} finally {
				setDownloadingPrefixes((prev) => {
					const copy = new Set(prev)
					copy.delete(prefix)
					return copy
				})
				console.log('[library] finished download', { prefix })
			}
		}

		const prefix = item.cfR2Link || null
		const downloaded = prefix ? isPrefixFullyCached(prefix) : false
const downloadedSize = prefix ? getCachedSizeForPrefix(prefix) : 0
const expectedSize = prefix ? getExpectedSizeForPrefix(prefix) : 0
const sizeLabel = prefix ? `${formatBytes(downloadedSize)}${expectedSize > 0 && !downloaded ? ` / ${formatBytes(expectedSize)}` : ''}` : null
		const downloading = prefix ? downloadingPrefixes.has(prefix) : false
		const onPressDownloadIcon = prefix && downloaded ? () => {
			Alert.alert(
				'Delete downloaded data?',
				'Remove this item\'s cached files from storage?',
				[
					{ text: 'Cancel', style: 'cancel' },
					{ text: 'Delete', style: 'destructive', onPress: () => { clearPrefix(prefix) } },
				]
			)
		} : undefined

		return (
			<ObjectCard
				title={item.title}
				username={username}
				tenantLabel={tenantLabel}
				categoryLabel={categoryLabel}
				collectionLabel={collectionLabel}
				onPress={onPress}
				downloaded={downloaded}
				downloading={downloading}
				sizeLabel={sizeLabel}
				onPressDownloadIcon={onPressDownloadIcon}
			/>
		)
	}

	const keyExtractor = useCallback((o: AppObject) => o.publicId, [])
	const onEndReached = useCallback(() => {
		if (!isLoading && cursor) loadPage()
	}, [isLoading, cursor, loadPage])

	return (
		<SafeAreaView className="flex-1" edges={['top']}>
			<FiltersBar
				search={search}
				onSearchChange={setSearch}
				selectedTenantId={tenantId}
				onTenantChange={setTenantId}
				selectedCategoryId={categoryId}
				onCategoryChange={setCategoryId}
				selectedCollectionId={collectionId}
				onCollectionChange={setCollectionId}
				tenantOptions={tenantOptions}
				categoryOptions={enabledCategoryIds.size > 0 ? categoryOptions.filter((o) => enabledCategoryIds.has(o.id)) : categoryOptions}
				collectionOptions={enabledCollectionIds.size > 0 ? collectionOptions.filter((o) => enabledCollectionIds.has(o.id)) : collectionOptions}
				sort={sort}
				onSortChange={setSort}
				sortDisabled={filteredAndSortedObjects.length === 0}
			/>

			{error ? (
				<View className="px-4 py-3"><Text className="text-red-500">{error}</Text></View>
			) : null}

			<FlatList
				// use filtered list for rendering
				data={filteredAndSortedObjects}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
				onEndReached={onEndReached}
				onEndReachedThreshold={0.5}
				ListEmptyComponent={
					!isLoading ? (
						<View className="flex-1 items-center justify-center py-24">
							<View className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4" />
							<Text className="text-zinc-500">No objects found</Text>
						</View>
					) : null
				}
				ListFooterComponent={
					isLoading ? (
					<View className="py-4"><ActivityIndicator /></View>
					) : null
				}
			/>
		</SafeAreaView>
	)
}


