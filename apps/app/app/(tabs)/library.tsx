import React, { useState } from 'react'
import { FlatList, StyleSheet, ActivityIndicator, View } from 'react-native'
import { useInfiniteQuery } from '@tanstack/react-query'

import { ScreenContainer } from '@/src/components/ScreenContainer'
import { LibraryItem } from '@/src/components/LibraryItem'
import { LibraryItemSkeleton } from '@/src/components/LibraryItemSkeleton'
import { SortSelector } from '@/src/components/SortSelector'
import { fetchLibraryObjects, type LibraryObject, type SortOption } from '@/lib/api'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

const PAGE_SIZE = 20

export default function LibraryScreen(): React.JSX.Element {
	const [sort, setSort] = useState<SortOption>('newest')

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		error,
	} = useInfiniteQuery({
		queryKey: ['library-objects', sort],
		queryFn: ({ pageParam = 1 }) => fetchLibraryObjects(pageParam, PAGE_SIZE, sort),
		getNextPageParam: (lastPage) => {
			const totalPages = Math.ceil(lastPage.total / lastPage.pageSize)
			const nextPage = lastPage.page + 1
			return nextPage <= totalPages ? nextPage : undefined
		},
		initialPageParam: 1,
	})

	const items = data?.pages.flatMap((page) => page.items) ?? []

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
			return (
				<ThemedView style={styles.emptyContainer}>
					<ThemedText style={styles.errorText}>
						{error instanceof Error ? error.message : 'Failed to load library items'}
					</ThemedText>
				</ThemedView>
			)
		}
		return (
			<ThemedView style={styles.emptyContainer}>
				<ThemedText>No items found</ThemedText>
			</ThemedView>
		)
	}

	return (
		<ScreenContainer title="Library">
			<View style={styles.header}>
				<SortSelector value={sort} onChange={setSort} />
			</View>
			{isLoading && items.length === 0 ? (
				<ThemedView style={styles.emptyContainer}>
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
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</ScreenContainer>
	)
}

const styles = StyleSheet.create({
	header: {
		marginBottom: 16,
		alignItems: 'flex-end',
	},
	listContent: {
		paddingBottom: 16,
	},
	footer: {
		paddingVertical: 16,
		alignItems: 'center',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 48,
	},
	errorText: {
		color: '#ff3b30',
		textAlign: 'center',
	},
})
