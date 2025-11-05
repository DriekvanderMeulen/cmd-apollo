import React from 'react'
import { StyleSheet, ActivityIndicator } from 'react-native'

import { ThemedView } from '@/components/themed-view'

export function LibraryItemSkeleton(): React.JSX.Element {
	return (
		<ThemedView style={styles.container}>
			<ThemedView style={styles.content}>
				<ThemedView style={styles.titlePlaceholder} />
				<ThemedView style={styles.descriptionPlaceholder} />
				<ThemedView style={styles.metaPlaceholder} />
			</ThemedView>
		</ThemedView>
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
	titlePlaceholder: {
		height: 16,
		width: '70%',
		backgroundColor: '#e0e0e0',
		borderRadius: 4,
		marginBottom: 8,
	},
	descriptionPlaceholder: {
		height: 14,
		width: '90%',
		backgroundColor: '#e8e8e8',
		borderRadius: 4,
		marginBottom: 4,
	},
	metaPlaceholder: {
		height: 12,
		width: '50%',
		backgroundColor: '#e8e8e8',
		borderRadius: 4,
	},
})

