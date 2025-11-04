import { useQuery } from '@tanstack/react-query'
import { Text, View } from 'react-native'
import { api } from '@/src/api/http'

export function PingStatus() {
	const { data, isLoading, error } = useQuery({
		queryKey: ['ping'],
		queryFn: () => api.get('/api/ping'),
	})

	if (isLoading) return <Text>Loading…</Text>
	if (error) return <Text>Failed to load ping</Text>

	return (
		<View>
			<Text>Ping:</Text>
			<Text>{typeof data === 'string' ? data : JSON.stringify(data)}</Text>
		</View>
	)
}


