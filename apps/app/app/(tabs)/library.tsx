import React, { useState, useEffect, useMemo } from 'react'
import { FlatList, StyleSheet, ActivityIndicator, View, RefreshControl, Pressable } from 'react-native'
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
	type LibraryObject,
	type SortOption,
} from '@/lib/api'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

const PAGE_SIZE = 20

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
					<Pressable onPress={handleRetry} style={styles.retryButton}>
						<ThemedText style={styles.retryButtonText}>Retry</ThemedText>
					</Pressable>
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
			return (
				<ThemedView style={styles.emptyContainer}>
					<ThemedText style={styles.emptyTitle} type="subtitle">
						No items yet
					</ThemedText>
					<ThemedText style={styles.emptyText}>
						Scan items to add them to your library.
					</ThemedText>
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
						<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
					}
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
		paddingBottom: 16,
	},
	listContentEmpty: {
		flexGrow: 1,
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
		backgroundColor: '#1068FF',
		borderRadius: 8,
	},
	retryButtonText: {
		color: '#fff',
		fontWeight: '600',
	},
})
