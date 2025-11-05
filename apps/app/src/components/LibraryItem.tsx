import React from 'react'
import { StyleSheet, Pressable } from 'react-native'
import { Link } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/src/providers/ThemeProvider'
import type { LibraryObject } from '@/lib/api'
import { extractPlainText } from '@/lib/rich-text'
import { fetchObjectDetail } from '@/lib/api'

type LibraryItemProps = {
	item: LibraryObject
}

export function LibraryItem({ item }: LibraryItemProps): React.JSX.Element {
	const { resolvedTheme: theme, isOLED } = useTheme()
	const queryClient = useQueryClient()

	const handlePressIn = () => {
		// Prefetch object detail when user presses the item
		queryClient.prefetchQuery({
			queryKey: ['object-detail', item.publicId],
			queryFn: async () => {
				const cachedData = queryClient.getQueryData<{ data: unknown; etag: string | null }>([
					'object-detail',
					item.publicId,
				])
				const result = await fetchObjectDetail(item.publicId, {
					ifNoneMatch: cachedData?.etag ?? undefined,
				})
				// Handle 304 Not Modified
				if (result.notModified && cachedData) {
					return cachedData
				}
				return { data: result.data, etag: result.etag }
			},
			staleTime: 5 * 60 * 1000, // 5 minutes
		})
	}

	return (
		<Link href={`/${item.publicId}`} asChild>
			<Pressable onPressIn={handlePressIn}>
				<ThemedView
					style={[
						styles.container,
						{
							backgroundColor:
								theme === 'light' ? '#f5f5f5' : isOLED ? '#000000' : '#2a2a2a',
						},
					]}
				>
					<ThemedView style={styles.content}>
						<ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={2}>
							{item.title}
						</ThemedText>
						{extractPlainText(item.description) ? (
							<ThemedText style={styles.description} numberOfLines={2}>
								{extractPlainText(item.description)}
							</ThemedText>
						) : null}
						{item.collection?.title ? (
							<ThemedText style={styles.meta} numberOfLines={1}>
								{item.collection.title}
							</ThemedText>
						) : null}
					</ThemedView>
				</ThemedView>
			</Pressable>
		</Link>
	)
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 16,
		borderRadius: 8,
		overflow: 'hidden',
	},
	content: {
		padding: 12,
	},
	title: {
		marginBottom: 4,
	},
	description: {
		fontSize: 14,
		marginBottom: 4,
		opacity: 0.7,
	},
	meta: {
		fontSize: 12,
		opacity: 0.6,
	},
})

