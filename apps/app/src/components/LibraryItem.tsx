import React from 'react'
import { StyleSheet, Pressable } from 'react-native'
import { Link } from 'expo-router'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import type { LibraryObject } from '@/lib/api'
import { extractPlainText } from '@/lib/rich-text'

type LibraryItemProps = {
	item: LibraryObject
}

export function LibraryItem({ item }: LibraryItemProps): React.JSX.Element {
	return (
		<Link href={`/${item.publicId}`} asChild>
			<Pressable>
				<ThemedView style={styles.container}>
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
		backgroundColor: '#f5f5f5',
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

