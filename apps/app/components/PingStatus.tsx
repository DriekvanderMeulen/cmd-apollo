import { useQuery } from '@tanstack/react-query'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from './themed-text'
import { api } from '@/src/api/http'

export function PingStatus() {
	const { data, isLoading, error } = useQuery({
		queryKey: ['ping'],
		queryFn: () => api.get('/api/ping'),
	})

	if (isLoading) return <ThemedText>Loading…</ThemedText>
	if (error) return <ThemedText>Failed to load ping</ThemedText>

	return (
		<View style={styles.container}>
			<ThemedText>Ping:</ThemedText>
			<ThemedText style={styles.value}>
				{typeof data === 'string' ? data : JSON.stringify(data)}
			</ThemedText>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		marginTop: 8,
	},
	value: {
		marginTop: 4,
	},
})
