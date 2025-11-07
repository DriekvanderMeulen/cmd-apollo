import { StyleSheet, ActivityIndicator, ScrollView, Pressable, View, Dimensions } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
	runOnJS,
	useDerivedValue,
} from 'react-native-reanimated'

import { useState } from 'react'
import { useObjectDetail } from '@/src/hooks/use-object-detail'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import { RichTextRenderer } from '@/src/components/RichTextRenderer'
import { VideoOnboarding } from '@/src/components/VideoOnboarding'
import { useTheme } from '@/src/providers/ThemeProvider'
import { Colors } from '@/constants/theme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function ObjectDetailScreen() {
	const { publicId } = useLocalSearchParams<{ publicId: string }>()
	const router = useRouter()
	const { resolvedTheme, isOLED } = useTheme()
	const { data, isLoading, isError, error } = useObjectDetail({
		publicId: publicId ?? '',
		enabled: Boolean(publicId),
	})
	const [hasCompletedVideo, setHasCompletedVideo] = useState(false)

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
	const firstIteration = sortedIterations[0]
	const translateX = useSharedValue(0)
	const currentPage = useSharedValue(0)
	const totalPages = sortedIterations.length + 1 // +1 for description page
	const startX = useSharedValue(0)

	const handleClose = () => {
		router.push('/(tabs)/library')
	}

	const handleShowIterations = () => {
		if (firstIteration) {
			currentPage.value = 1
			translateX.value = withTiming(-SCREEN_WIDTH, {
				duration: 200,
			})
		}
	}

	const goToPage = (page: number) => {
		'worklet'
		if (page >= 0 && page < totalPages) {
			currentPage.value = page
			translateX.value = withTiming(-SCREEN_WIDTH * page, {
				duration: 200,
			})
		}
	}

	const syncCurrentPage = () => {
		'worklet'
		const page = Math.round(-translateX.value / SCREEN_WIDTH)
		currentPage.value = Math.max(0, Math.min(page, totalPages - 1))
	}

	const handleSwipeLeft = () => {
		const nextPage = Math.min(Math.round(currentPage.value) + 1, totalPages - 1)
		goToPage(nextPage)
	}

	const handleSwipeRight = () => {
		const prevPage = Math.max(Math.round(currentPage.value) - 1, 0)
		goToPage(prevPage)
	}

	const panGesture = Gesture.Pan()
		.onStart((event) => {
			startX.value = translateX.value
		})
		.onUpdate((event) => {
			// Only update if horizontal movement is dominant
			if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
				const newX = startX.value + event.translationX
				const minX = -SCREEN_WIDTH * (totalPages - 1)
				const maxX = 0
				translateX.value = Math.max(minX, Math.min(maxX, newX))
			}
		})
		.onEnd((event) => {
			// Only handle horizontal swipes
			if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
				const threshold = SCREEN_WIDTH * 0.3
				const velocity = event.velocityX

				if (Math.abs(event.translationX) > threshold || Math.abs(velocity) > 500) {
					if (event.translationX > 0 || velocity > 0) {
						handleSwipeRight()
					} else {
						handleSwipeLeft()
					}
				} else {
					// Snap back to nearest page
					syncCurrentPage()
					translateX.value = withTiming(-SCREEN_WIDTH * currentPage.value, {
						duration: 200,
					})
				}
			} else {
				// If vertical swipe, snap back
				syncCurrentPage()
				translateX.value = withTiming(-SCREEN_WIDTH * currentPage.value, {
					duration: 200,
				})
			}
		})
		.activeOffsetX([-10, 10])

	const isOnDescriptionPage = useDerivedValue(() => {
		return currentPage.value === 0
	})

	const isOnLastPage = useDerivedValue(() => {
		return currentPage.value === totalPages - 1
	})

	const hasNextPage = useDerivedValue(() => {
		return currentPage.value < totalPages - 1
	})

	const hasPreviousPage = useDerivedValue(() => {
		return currentPage.value > 0
	})

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: translateX.value }],
		}
	})

	const showIterationsButtonOpacity = useAnimatedStyle(() => {
		return {
			opacity: isOnDescriptionPage.value ? 1 : 0,
			pointerEvents: isOnDescriptionPage.value ? 'auto' : 'none',
		}
	})

	const navButtonsOpacity = useAnimatedStyle(() => {
		return {
			opacity: isOnDescriptionPage.value ? 0 : 1,
			pointerEvents: isOnDescriptionPage.value ? 'none' : 'auto',
		}
	})

	const previousButtonOpacity = useAnimatedStyle(() => {
		return {
			opacity: hasPreviousPage.value ? 1 : 0,
			pointerEvents: hasPreviousPage.value ? 'auto' : 'none',
		}
	})

	const nextButtonOpacity = useAnimatedStyle(() => {
		return {
			opacity: hasNextPage.value ? 1 : 0,
			pointerEvents: hasNextPage.value ? 'auto' : 'none',
		}
	})

	// Show video onboarding first if video exists and hasn't been completed
	if (objectData.videoUrl && !hasCompletedVideo) {
		return (
			<VideoOnboarding
				videoUri={objectData.videoUrl}
				posterUri={objectData.posterUrl}
				onComplete={() => setHasCompletedVideo(true)}
				onError={() => setHasCompletedVideo(true)} // Allow proceeding on error
			/>
		)
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'left', 'right']}>
				<View style={styles.header}>
					<Pressable onPress={handleClose} style={styles.closeButton}>
						<Ionicons name="close" size={24} color={textColor} />
					</Pressable>
				</View>
				<View style={styles.carouselWrapper}>
					<GestureDetector gesture={panGesture}>
						<Animated.View
							style={[
								styles.carouselContainer,
								animatedStyle,
								{ width: SCREEN_WIDTH * totalPages },
							]}
						>
						{/* Description Page */}
						<View style={[styles.page, { width: SCREEN_WIDTH }]}>
							<ScrollView
								style={styles.scrollView}
								contentContainerStyle={styles.scrollContent}
								showsVerticalScrollIndicator={false}
							>
								<ThemedView style={styles.container}>
									<ThemedText type="title" style={styles.title}>
										{objectData.title}
									</ThemedText>

									{objectData.description ? (
										<RichTextRenderer content={objectData.description} style={styles.description} />
									) : null}
								</ThemedView>
							</ScrollView>
						</View>

						{/* Iteration Pages */}
						{sortedIterations.map((iteration, index) => (
							<View key={iteration.id} style={[styles.page, { width: SCREEN_WIDTH }]}>
								<ScrollView
									style={styles.scrollView}
									contentContainerStyle={styles.scrollContent}
									showsVerticalScrollIndicator={false}
								>
									<ThemedView style={styles.container}>
										<ThemedText type="title" style={styles.title}>
											{iteration.title}
										</ThemedText>

										<ThemedText style={styles.date}>
											{new Date(iteration.date).toLocaleDateString()}
										</ThemedText>

										{iteration.description ? (
											<RichTextRenderer content={iteration.description} style={styles.description} />
										) : null}
									</ThemedView>
								</ScrollView>
							</View>
						))}
						</Animated.View>
					</GestureDetector>
				</View>
				{firstIteration ? (
					<Animated.View style={[showIterationsButtonOpacity, { position: 'absolute', bottom: 0, left: 0, right: 0 }]}>
						<SafeAreaView edges={['bottom']} style={styles.bottomSafeArea}>
							<Pressable
								onPress={handleShowIterations}
								style={[
									styles.nextButton,
									{
										backgroundColor:
											resolvedTheme === 'light'
												? Colors.light.tint
												: '#0a7ea4',
									},
								]}
							>
								<ThemedText style={styles.nextButtonText}>Show Iterations</ThemedText>
							</Pressable>
						</SafeAreaView>
					</Animated.View>
				) : null}
				<Animated.View style={[navButtonsOpacity, { position: 'absolute', bottom: 0, left: 0, right: 0 }]}>
					<SafeAreaView edges={['bottom']} style={styles.bottomSafeArea}>
						<View style={styles.navigationButtons}>
							<Animated.View style={previousButtonOpacity}>
								<Pressable
									onPress={() => handleSwipeRight()}
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
							</Animated.View>
							<Animated.View style={nextButtonOpacity}>
								<Pressable
									onPress={() => handleSwipeLeft()}
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
							</Animated.View>
						</View>
					</SafeAreaView>
				</Animated.View>
			</SafeAreaView>
		</GestureHandlerRootView>
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
	carouselWrapper: {
		flex: 1,
		overflow: 'hidden',
	},
	carouselContainer: {
		flex: 1,
		flexDirection: 'row',
		height: '100%',
	},
	page: {
		width: SCREEN_WIDTH,
		height: '100%',
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
	nextButton: {
		paddingVertical: 16,
		paddingHorizontal: 24,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	nextButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
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
})
