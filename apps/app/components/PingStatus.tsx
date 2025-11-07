import { useQuery } from '@tanstack/react-query'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from './themed-text'
import { api } from '@/src/api/http'

export function PingStatus() {
	const { data, isLoading, error } = useQuery({
		queryKey: ['ping'],
		queryFn: async () => {
			console.log('[PingStatus] Starting ping request')
			try {
				const result = await api.get('/api/ping')
				console.log('[PingStatus] Ping success:', result)
				return result
			} catch (err) {
				console.error('[PingStatus] Ping error:', err)
				throw err
			}
		},
	})

	if (isLoading) return <ThemedText>Loading…</ThemedText>
	if (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		console.error('[PingStatus] Render error:', errorMessage)
		return <ThemedText>Failed to load ping: {errorMessage}</ThemedText>
	}

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
