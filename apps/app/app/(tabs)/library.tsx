import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { FlatList, StyleSheet, ActivityIndicator, View, RefreshControl, Pressable, Text } from 'react-native'
import { Svg, Path } from 'react-native-svg'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

import { ScreenContainer } from '@/src/components/ScreenContainer'
import { LibraryItem } from '@/src/components/LibraryItem'
import { LibraryItemSkeleton } from '@/src/components/LibraryItemSkeleton'
import { SortSelector } from '@/src/components/SortSelector'
import { CombinedFilterDropdown } from '@/src/components/CombinedFilterDropdown'
import { SearchBar } from '@/src/components/SearchBar'
import {
	fetchLibraryObjects,
	fetchCollections,
	fetchCategories,
	fetchObjectDetail,
	type LibraryObject,
	type SortOption,
} from '@/lib/api'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useThemeColor } from '@/hooks/use-theme-color'

const PAGE_SIZE = 20

const scribbleSvg = `M.37,29.99C.25,48.08.12,66.18,0,84.28c-.1,13.94,17.97,17.59,25.13,6.81,11.86-17.86,23.79-35.64,39.89-50.01l-22.54-13.12c-6.74,28-13.48,56-20.22,83.99-1.56,6.49,1.5,13.37,7.81,15.91,5.93,2.39,13.69.54,16.84-5.52,17.29-33.28,34.57-67.26,57.79-96.9-7.51-4.37-15.03-8.75-22.54-13.12-6.39,19.55-11.94,39.37-16.56,59.41-2.28,9.89-4.34,19.83-6.18,29.81s-6.46,23.29.05,32.01c2.94,3.93,6.47,6.68,11.64,6.68,4.32,0,9.81-2.47,11.64-6.68,14.54-33.29,31.36-65.52,50.39-96.45-8.22-3.46-16.43-6.93-24.65-10.39-6.12,31.29-12.08,62.62-15.42,94.35-.61,5.79,4.62,11.55,9.9,13,5.74,1.58,12.23-1.04,15.23-6.2,21.49-36.89,44.59-72.83,69.25-107.69-8.22-3.46-16.43-6.93-24.65-10.39-12.02,37.89-25.75,75.22-41.17,111.86-5.16,12.26,14.34,23.31,22.54,13.12,25.18-31.31,51.63-61.57,79.32-90.68-7.51-4.37-15.03-8.75-22.54-13.12-10.92,33.9-28.79,64.92-41.1,98.61-2.28,6.23,2.04,13.59,7.81,15.91,6.38,2.57,13.09.25,16.84-5.52,15.48-23.8,38.21-41.35,56.87-62.58,4.8-5.47,5.38-13.69,0-19.07-4.9-4.9-14.24-5.49-19.07,0-20.25,23.05-44.2,42.07-61.09,68.04,8.22,3.46,16.43,6.93,24.65,10.39,12.24-33.51,30.14-64.57,41.1-98.61,4.14-12.85-13.41-22.72-22.54-13.12-27.69,29.11-54.14,59.37-79.32,90.68,7.51,4.37,15.03,8.75,22.54,13.12,15.42-36.64,29.15-73.97,41.17-111.86,2.01-6.34-1.84-13.51-7.81-15.91-6.57-2.64-12.85-.12-16.84,5.52-24.66,34.86-47.75,70.79-69.25,107.69l25.13,6.81c3.08-29.32,8.8-58.27,14.45-87.18,2.87-14.66-16.32-23.91-24.65-10.39-19.04,30.93-35.86,63.16-50.39,96.45h23.29c.68.9-.14,5.33.53.96.39-2.51.84-5.01,1.29-7.51.78-4.37,1.59-8.74,2.45-13.1,1.78-9.02,3.74-18,5.88-26.94,4.35-18.16,9.46-36.12,15.25-53.86,1.84-5.63-1.22-12.32-6.2-15.23-4.73-2.77-12.71-2.53-16.34,2.11-24.77,31.61-43.56,66.83-62.01,102.35,8.22,3.46,16.43,6.93,24.65,10.39,6.74-28,13.48-56,20.22-83.99,3.23-13.42-12.53-22.05-22.54-13.12C28.23,37.82,14.89,57.81,1.84,77.47l25.13,6.81c.12-18.1.25-36.19.37-54.29S.49,12.61.37,29.99H.37Z`

function isNetworkError(error: unknown): boolean {
	if (!(error instanceof Error)) return false
	const message = error.message.toLowerCase()
	return (
		message.includes('network') ||
		message.includes('fetch') ||
		message.includes('failed to fetch') ||
		message.includes('network request failed') ||
		message.includes('offline') ||
		message.includes('internet connection')
	)
}

export default function LibraryScreen(): React.JSX.Element {
	const [sort, setSort] = useState<SortOption>('newest')
	const [selectedCollectionIds, setSelectedCollectionIds] = useState<Array<number>>([])
	const [selectedCategoryIds, setSelectedCategoryIds] = useState<Array<number>>([])
	const [openDropdown, setOpenDropdown] = useState<'filter' | 'sort' | null>(null)
	const [searchInput, setSearchInput] = useState('')
	const [refreshing, setRefreshing] = useState(false)
	const queryClient = useQueryClient()

	// Prefetch collections and categories on load with 24-hour cache
	useEffect(() => {
		queryClient.prefetchQuery({
			queryKey: ['collections'],
			queryFn: fetchCollections,
			staleTime: 24 * 60 * 60 * 1000, // 24 hours
			gcTime: 24 * 60 * 60 * 1000, // 24 hours
		})
		queryClient.prefetchQuery({
			queryKey: ['categories'],
			queryFn: fetchCategories,
			staleTime: 24 * 60 * 60 * 1000, // 24 hours
			gcTime: 24 * 60 * 60 * 1000, // 24 hours
		})
	}, [queryClient])

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		error,
		refetch,
	} = useInfiniteQuery({
		queryKey: ['library-objects', sort, selectedCollectionIds, selectedCategoryIds],
		queryFn: ({ pageParam = 1 }) =>
			fetchLibraryObjects(
				pageParam,
				PAGE_SIZE,
				sort,
				selectedCollectionIds.length > 0 ? selectedCollectionIds : undefined,
				selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined
			),
		getNextPageParam: (lastPage) => {
			const totalPages = Math.ceil(lastPage.total / lastPage.pageSize)
			const nextPage = lastPage.page + 1
			return nextPage <= totalPages ? nextPage : undefined
		},
		initialPageParam: 1,
	})

	const allItems = data?.pages.flatMap((page) => page.items) ?? []

	// Local search on already fetched data - no refetching
	// Filter immediately as user types
	const items = useMemo(() => {
		if (!searchInput || searchInput.trim().length === 0) {
			return allItems
		}

		const searchLower = searchInput.toLowerCase().trim()
		return allItems.filter((item) => {
			const titleMatch = item.title.toLowerCase().includes(searchLower)
			// Note: tags field doesn't exist in LibraryObject type, so only searching by title
			// If tags are added later, they can be included here: item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
			return titleMatch
		})
	}, [allItems, searchInput])

	const hasActiveFilters = selectedCollectionIds.length > 0 || selectedCategoryIds.length > 0
	const hasSearchQuery = searchInput.trim().length > 0
	// Empty from filters: items filtered out by local search, or API returned no results with active filters
	const isEmptyFromFilters =
		items.length === 0 &&
		!isLoading &&
		!isError &&
		(hasSearchQuery || (allItems.length === 0 && hasActiveFilters))
	// Truly empty: no items at all, no filters, no search
	const isEmptyList = items.length === 0 && !isLoading && !isError && !hasActiveFilters && !hasSearchQuery

	const handleRefresh = async () => {
		setRefreshing(true)
		try {
			await refetch()
		} finally {
			setRefreshing(false)
		}
	}

	const handleRetry = () => {
		refetch()
	}

	const handleLoadMore = () => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}

	const handleViewableItemsChanged = useCallback(
		({ viewableItems }: { viewableItems: Array<{ item: LibraryObject }> }) => {
			// Prefetch details for visible items (up to 3 ahead)
			viewableItems.slice(0, 3).forEach(({ item }) => {
				const cachedData = queryClient.getQueryData<{ data: unknown; etag: string | null }>([
					'object-detail',
					item.publicId,
				])
				// Only prefetch if not already cached
				if (!cachedData) {
					queryClient.prefetchQuery({
						queryKey: ['object-detail', item.publicId],
						queryFn: async () => {
							const result = await fetchObjectDetail(item.publicId)
							if (result.notModified) {
								// Should not happen on first fetch, but handle it
								throw new Error('Unexpected 304 on initial fetch')
							}
							return { data: result.data, etag: result.etag }
						},
						staleTime: 5 * 60 * 60 * 1000, // 5 minutes
					})
				}
			})
		},
		[queryClient]
	)

	const viewabilityConfig = useMemo(
		() => ({
			itemVisiblePercentThreshold: 50,
		}),
		[]
	)

	const renderItem = ({ item }: { item: LibraryObject }) => {
		return <LibraryItem item={item} />
	}

	const renderFooter = () => {
		if (!isFetchingNextPage) return null
		return (
			<ThemedView style={styles.footer}>
				<ActivityIndicator size="small" />
			</ThemedView>
		)
	}

	const renderEmpty = () => {
		if (isError) {
			const isOffline = isNetworkError(error)
			return (
				<ThemedView style={styles.emptyContainer}>
					<ThemedText style={styles.errorTitle} type="subtitle">
						{isOffline ? 'You\'re offline' : 'Something went wrong'}
					</ThemedText>
					<ThemedText style={styles.errorText}>
						{isOffline
							? 'Please check your internet connection and try again.'
							: error instanceof Error
								? error.message
								: 'Failed to load library items'}
					</ThemedText>
					<ThemedView lightColor="#81C7B4" darkColor="#EBBED3" style={styles.retryButton}>
						<ThemedText style={styles.retryButtonText} lightColor="#000000" darkColor="#000000">Retry</ThemedText>
					</ThemedView>
				</ThemedView>
			)
		}

		if (isEmptyFromFilters) {
			return (
				<ThemedView style={styles.emptyContainer}>
					<ThemedText style={styles.emptyTitle} type="subtitle">
						No items match your filters
					</ThemedText>
					<ThemedText style={styles.emptyText}>
						{hasSearchQuery
							? 'Try adjusting your search or filters to see more results.'
							: 'Try adjusting your filters to see more results.'}
					</ThemedText>
				</ThemedView>
			)
		}

		if (isEmptyList) {
			const accentColor = useThemeColor({}, 'accent')
			return (
				<ThemedView style={styles.emptyContainer}>
					<ThemedView style={[styles.scribbleContainer, { backgroundColor: accentColor }]}>
						<Svg width="200" height="120" viewBox="0 0 245.21 146.53">
							<Path d={scribbleSvg} fill={accentColor} />
						</Svg>
						<View style={styles.scribbleTextOverlay}>
							<ThemedText style={styles.emptyTitle} type="subtitle" lightColor="#000000" darkColor="#000000">
								No items yet
							</ThemedText>
							<ThemedText style={styles.emptyText} lightColor="#000000" darkColor="#000000">
								Scan items to add them to your library.
							</ThemedText>
						</View>
					</ThemedView>
				</ThemedView>
			)
		}

		return null
	}

	return (
		<ScreenContainer title="Library">
			<View style={styles.header}>
				<View style={styles.searchContainer}>
					<SearchBar
						value={searchInput}
						onChangeText={setSearchInput}
						placeholder="Search by title..."
					/>
				</View>
				<View style={styles.filters}>
					<View style={styles.filterItem}>
						<CombinedFilterDropdown
							selectedCollectionIds={selectedCollectionIds}
							selectedCategoryIds={selectedCategoryIds}
							onCollectionChange={setSelectedCollectionIds}
							onCategoryChange={setSelectedCategoryIds}
							isOpen={openDropdown === 'filter'}
							onOpenChange={(open) => setOpenDropdown(open ? 'filter' : null)}
						/>
					</View>
					<View style={styles.filterItem}>
						<SortSelector
							value={sort}
							onChange={setSort}
							isOpen={openDropdown === 'sort'}
							onOpenChange={(open) => setOpenDropdown(open ? 'sort' : null)}
						/>
					</View>
				</View>
			</View>
			{isLoading && items.length === 0 && !isError ? (
				<ThemedView style={styles.skeletonContainer}>
					<LibraryItemSkeleton />
					<LibraryItemSkeleton />
					<LibraryItemSkeleton />
				</ThemedView>
			) : (
				<FlatList
					data={items}
					renderItem={renderItem}
					keyExtractor={(item) => item.publicId}
					onEndReached={handleLoadMore}
					onEndReachedThreshold={0.5}
					ListFooterComponent={renderFooter}
					ListEmptyComponent={renderEmpty}
					contentContainerStyle={
						items.length === 0 ? styles.listContentEmpty : styles.listContent
					}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl 
							refreshing={refreshing} 
							onRefresh={handleRefresh}
							colors={['#000000']}
							tintColor="#000000"
							progressBackgroundColor="#000000"
							title="Pull to refresh"
							titleColor="#000000"
						/>
					}
					onViewableItemsChanged={handleViewableItemsChanged}
					viewabilityConfig={viewabilityConfig}
				/>
			)}
		</ScreenContainer>
	)
}

const styles = StyleSheet.create({
	header: {
		marginBottom: 16,
	},
	searchContainer: {
		marginBottom: 12,
	},
	filters: {
		flexDirection: 'row',
		gap: 8,
	},
	filterItem: {
		flex: 1,
	},
	listContent: {
		paddingTop: 16,
		paddingBottom: 16,
	},
	listContentEmpty: {
		flexGrow: 1,
		paddingTop: 16,
		paddingBottom: 16,
	},
	footer: {
		paddingVertical: 16,
		alignItems: 'center',
	},
	skeletonContainer: {
		flex: 1,
		paddingVertical: 16,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 48,
		paddingHorizontal: 24,
	},
	errorTitle: {
		marginBottom: 8,
		textAlign: 'center',
	},
	errorText: {
		color: '#ff3b30',
		textAlign: 'center',
		marginBottom: 24,
	},
	emptyTitle: {
		marginBottom: 8,
		textAlign: 'center',
	},
	emptyText: {
		textAlign: 'center',
		opacity: 0.7,
	},
	retryButton: {
		marginTop: 8,
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	retryButtonText: {
		fontWeight: '600',
	},
	scribbleContainer: {
		position: 'relative',
		width: 200,
		height: 120,
		borderRadius: 8,
		overflow: 'hidden',
		justifyContent: 'center',
		alignItems: 'center',
	},
	scribbleTextOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 16,
	},
})
