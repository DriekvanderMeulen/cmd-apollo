import { StyleSheet, ActivityIndicator, ScrollView, Pressable, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useObjectDetail } from '@/src/hooks/use-object-detail'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import { RichTextRenderer } from '@/src/components/RichTextRenderer'
import { useTheme } from '@/src/providers/ThemeProvider'
import { Colors } from '@/constants/theme'

export default function IterationDetailScreen() {
	const { publicId, iterationId } = useLocalSearchParams<{ publicId: string; iterationId: string }>()
	const router = useRouter()
	const { resolvedTheme, isOLED } = useTheme()
	const { data, isLoading, isError, error } = useObjectDetail({
		publicId: publicId ?? '',
		enabled: Boolean(publicId),
	})

	const backgroundColor =
		resolvedTheme === 'light' ? '#fff' : isOLED ? '#000000' : Colors.dark.background
	const textColor = resolvedTheme === 'light' ? '#000' : '#fff'

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

	if (!data?.data) {
		return (
			<SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'left', 'right', 'bottom']}>
				<ThemedView style={styles.container}>
					<ThemedText>No data available</ThemedText>
				</ThemedView>
			</SafeAreaView>
		)
	}

	const objectData = data.data
	const sortedIterations = [...objectData.iterations].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	)
	const currentIterationId = iterationId ? Number(iterationId) : null
	const currentIndex = currentIterationId
		? sortedIterations.findIndex((it) => it.id === currentIterationId)
		: -1
	const currentIteration = currentIndex >= 0 ? sortedIterations[currentIndex] : null
	const previousIteration = currentIndex > 0 ? sortedIterations[currentIndex - 1] : null
	const nextIteration =
		currentIndex >= 0 && currentIndex < sortedIterations.length - 1
			? sortedIterations[currentIndex + 1]
			: null
	const isFirstIteration = currentIndex === 0

	const handleClose = () => {
		router.push('/(tabs)/library')
	}

	const handlePrevious = () => {
		if (isFirstIteration) {
			// Go back to object detail screen
			router.push(`/${publicId}`)
		} else if (previousIteration) {
			router.push(`/${publicId}/iteration/${previousIteration.id}`)
		}
	}

	const handleNext = () => {
		if (nextIteration) {
			router.push(`/${publicId}/iteration/${nextIteration.id}`)
		}
	}

	if (!currentIteration) {
		return (
			<SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'left', 'right', 'bottom']}>
				<ThemedView style={styles.container}>
					<ThemedText>Iteration not found</ThemedText>
				</ThemedView>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'left', 'right']}>
			<View style={styles.header}>
				<Pressable onPress={handleClose} style={styles.closeButton}>
					<Ionicons name="close" size={24} color={textColor} />
				</Pressable>
			</View>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<ThemedView style={styles.container}>
					<ThemedText type="title" style={styles.title}>
						{currentIteration.title}
					</ThemedText>

					<ThemedText style={styles.date}>
						{new Date(currentIteration.date).toLocaleDateString()}
					</ThemedText>

					{currentIteration.description ? (
						<RichTextRenderer content={currentIteration.description} style={styles.description} />
					) : null}
				</ThemedView>
			</ScrollView>
			<SafeAreaView edges={['bottom']} style={styles.bottomSafeArea}>
				<View style={styles.navigationButtons}>
					{(isFirstIteration || previousIteration) ? (
						<Pressable
							onPress={handlePrevious}
							style={[
								styles.navButton,
								{
									backgroundColor:
										resolvedTheme === 'light'
											? Colors.light.tint
											: '#0a7ea4',
								},
							]}
						>
							<Ionicons name="chevron-back" size={24} color="#fff" />
						</Pressable>
					) : (
						<View style={styles.navButtonPlaceholder} />
					)}
					{nextIteration ? (
						<Pressable
							onPress={handleNext}
							style={[
								styles.navButton,
								{
									backgroundColor:
										resolvedTheme === 'light'
											? Colors.light.tint
											: '#0a7ea4',
								},
							]}
						>
							<Ionicons name="chevron-forward" size={24} color="#fff" />
						</Pressable>
					) : (
						<View style={styles.navButtonPlaceholder} />
					)}
				</View>
			</SafeAreaView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	header: {
		paddingHorizontal: 20,
		paddingTop: 8,
		paddingBottom: 8,
	},
	closeButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 20,
	},
	container: {
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
	date: {
		fontSize: 14,
		opacity: 0.7,
		marginBottom: 12,
	},
	description: {
		marginBottom: 12,
	},
	bottomSafeArea: {
		paddingHorizontal: 20,
		paddingTop: 16,
		paddingBottom: 8,
	},
	navigationButtons: {
		flexDirection: 'row',
		gap: 12,
		justifyContent: 'space-between',
	},
	navButton: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	navButtonPlaceholder: {
		width: 48,
		height: 48,
	},
})

