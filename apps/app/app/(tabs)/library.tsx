import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, ListRenderItemInfo, RefreshControl, View, Text } from 'react-native'
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
	const { ensurePrefix, downloadKey } = useR2Cache()

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
			const prefix = item.cfR2Link || null
			if (!prefix) return
			if (downloadingPrefixes.has(prefix)) return
			setDownloadingPrefixes((prev) => new Set(prev).add(prefix))
			try {
				const list = await ensurePrefix(prefix)
				await Promise.all(
					list.map(async (entry) => {
						if (!entry.key) return
						await downloadKey(entry.key)
					})
				)
			} catch (e) {
				// no-op error surface here; could integrate toast later
			} finally {
				setDownloadingPrefixes((prev) => {
					const copy = new Set(prev)
					copy.delete(prefix)
					return copy
				})
			}
		}

		return (
			<ObjectCard
				title={item.title}
				username={username}
				tenantLabel={tenantLabel}
				categoryLabel={categoryLabel}
				collectionLabel={collectionLabel}
				onPress={onPress}
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


