import { StyleSheet, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'

import { fetchObjectByToken } from '@/lib/api'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import { ObjectViewer } from '@/src/components/ObjectViewer'
import { useTheme } from '@/src/providers/ThemeProvider'
import { Colors } from '@/constants/theme'

export default function OpenScreen() {
	const { token } = useLocalSearchParams<{ token: string }>()
	const router = useRouter()
	const { resolvedTheme, isOLED } = useTheme()

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['object-by-token', token],
		queryFn: () => fetchObjectByToken(token ?? ''),
		enabled: Boolean(token),
	})

	const backgroundColor =
		resolvedTheme === 'light' ? '#fff' : isOLED ? '#000000' : Colors.dark.background

	if (!token) {
		return (
			<SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'left', 'right', 'bottom']}>
				<ThemedView style={styles.container}>
					<ThemedText style={styles.errorText}>Missing token</ThemedText>
				</ThemedView>
			</SafeAreaView>
		)
	}

	if (isLoading) {
		return (
			<SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'left', 'right', 'bottom']}>
				<ThemedView style={styles.container}>
					<ActivityIndicator size="large" />
					<ThemedText style={styles.loadingText}>Loading...</ThemedText>
				</ThemedView>
			</SafeAreaView>
		)
	}

	if (isError) {
		return (
			<SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'left', 'right', 'bottom']}>
				<ThemedView style={styles.container}>
					<ThemedText style={styles.errorText}>
						Error: {error instanceof Error ? error.message : 'Failed to load data'}
					</ThemedText>
				</ThemedView>
			</SafeAreaView>
		)
	}

	if (!data) {
		return (
			<SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'left', 'right', 'bottom']}>
				<ThemedView style={styles.container}>
					<ThemedText>No data available</ThemedText>
				</ThemedView>
			</SafeAreaView>
		)
	}

	return <ObjectViewer objectData={data} />
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	loadingText: {
		marginTop: 16,
		textAlign: 'center',
	},
	errorText: {
		color: 'red',
		textAlign: 'center',
	},
})

