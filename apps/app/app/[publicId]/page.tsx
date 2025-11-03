import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

import { fetchObjectData } from '@/lib/api'
import { storeObjectData, getObjectData, type ObjectData } from '@/lib/storage'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'

export default function ObjectDetailScreen() {
	const { publicId } = useLocalSearchParams<{ publicId: string }>()
	const [data, setData] = useState<ObjectData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!publicId) {
			setError('No public ID provided')
			setLoading(false)
			return
		}

		async function loadData() {
			try {
				// Try to load from cache first
				const cachedData = await getObjectData(publicId)
				if (cachedData) {
					setData(cachedData)
					setLoading(false)
				}

				// Fetch fresh data
				const freshData = await fetchObjectData(publicId)
				await storeObjectData(publicId, freshData)
				setData(freshData)
				setLoading(false)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load data')
				setLoading(false)
			}
		}

		loadData()
	}, [publicId])

	if (loading) {
		return (
			<ThemedView style={styles.container}>
				<ActivityIndicator size="large" />
				<ThemedText style={styles.loadingText}>Loading...</ThemedText>
			</ThemedView>
		)
	}

	if (error) {
		return (
			<ThemedView style={styles.container}>
				<ThemedText style={styles.errorText}>Error: {error}</ThemedText>
			</ThemedView>
		)
	}

	if (!data) {
		return (
			<ThemedView style={styles.container}>
				<ThemedText>No data available</ThemedText>
			</ThemedView>
		)
	}

	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title" style={styles.title}>
				{data.object.title}
			</ThemedText>
			<ThemedText style={styles.subtitle}>
				Public ID: {data.object.publicId}
			</ThemedText>
			<ThemedText style={styles.sectionTitle}>
				Iterations: {data.iterations.length}
			</ThemedText>
			<ThemedText style={styles.sectionTitle}>
				R2 Files: {data.r2Files.length}
			</ThemedText>
		</ThemedView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		gap: 16,
	},
	loadingText: {
		marginTop: 16,
		textAlign: 'center',
	},
	errorText: {
		color: 'red',
		textAlign: 'center',
	},
	title: {
		marginBottom: 8,
	},
	subtitle: {
		opacity: 0.7,
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '600',
		marginTop: 8,
	},
})

