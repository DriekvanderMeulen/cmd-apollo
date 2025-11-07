import { useState, useEffect, useRef } from 'react'
import { View, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native'
import { useVideoPlayer, VideoView, VideoSource } from 'expo-video'
import { useEvent } from 'expo'
import * as Linking from 'expo-linking'
import { useTheme } from '@/src/providers/ThemeProvider'
import { Colors } from '@/constants/theme'
import { ThemedText } from '@/components/themed-text'

// Web video component
function WebVideoPlayer({
	videoUri,
	posterUri,
	onComplete,
}: {
	videoUri: string
	posterUri?: string | null
	onComplete: () => void
}) {
	const videoRef = useRef<HTMLVideoElement>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [hasError, setHasError] = useState(false)

	useEffect(() => {
		const video = videoRef.current
		if (!video) return

		const handleCanPlay = () => {
			setIsLoading(false)
			video.play().catch((err) => {
				console.error('Video play error:', err)
				setHasError(true)
			})
		}

		const handleEnded = () => {
			onComplete()
		}

		const handleError = () => {
			console.error('Video error:', video.error)
			setHasError(true)
			setIsLoading(false)
		}

		video.addEventListener('canplay', handleCanPlay)
		video.addEventListener('ended', handleEnded)
		video.addEventListener('error', handleError)

		return () => {
			video.removeEventListener('canplay', handleCanPlay)
			video.removeEventListener('ended', handleEnded)
			video.removeEventListener('error', handleError)
		}
	}, [onComplete])

	if (hasError) {
		return (
			<View style={styles.container}>
				<ThemedText style={styles.errorText}>Video playback failed</ThemedText>
				<ThemedText style={styles.errorSubtext}>
					You can watch the video in your browser or skip to continue
				</ThemedText>
				<View style={styles.buttonContainer}>
					<ThemedText
						onPress={() => {
							window.open(videoUri, '_blank')
							onComplete()
						}}
						style={styles.linkButton}
					>
						Watch in browser
					</ThemedText>
					<ThemedText onPress={onComplete} style={styles.linkButton}>
						Skip
					</ThemedText>
				</View>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			{/* @ts-expect-error - web video element */}
			<video
				ref={videoRef}
				src={videoUri}
				poster={posterUri || undefined}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'contain',
				}}
				controls={false}
				playsInline
				autoPlay
				muted={false}
			/>
			{isLoading ? (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" />
					<ThemedText style={styles.loadingText}>Loading video...</ThemedText>
				</View>
			) : null}
		</View>
	)
}

type VideoOnboardingProps = {
	videoUri: string
	posterUri?: string | null
	onComplete: () => void
	onError?: () => void
}

export function VideoOnboarding({
	videoUri,
	posterUri,
	onComplete,
	onError,
}: VideoOnboardingProps) {
	const [hasError, setHasError] = useState(false)
	const hasCompletedRef = useRef(false)
	const { resolvedTheme, isOLED } = useTheme()

	const backgroundColor =
		resolvedTheme === 'light' ? '#fff' : isOLED ? '#000000' : Colors.dark.background
	const textColor = resolvedTheme === 'light' ? '#000' : '#fff'

	const videoSource: VideoSource = {
		uri: videoUri,
		...(posterUri ? { poster: posterUri } : {}),
	}

	const player = useVideoPlayer(videoSource, (player) => {
		player.muted = false // Play with sound
		player.play() // Auto-play
	})

	const { status } = useEvent(player, 'statusChange', { status: player.status })
	const { playing } = useEvent(player, 'playingChange', { playing: player.playing })

	useEffect(() => {
		if (status === 'readyToPlay') {
			// Video is ready, ensure it's playing
			if (!playing) {
				player.play()
			}
		} else if (status === 'error') {
			setHasError(true)
			if (onError) {
				onError()
			}
		}
	}, [status, playing, player])

	useEffect(() => {
		// Listen for when video finishes
		const subscription = player.addListener('playToEnd', () => {
			if (!hasCompletedRef.current) {
				hasCompletedRef.current = true
				// Small delay to ensure smooth transition
				setTimeout(() => {
					onComplete()
				}, 500)
			}
		})

		return () => {
			subscription.remove()
		}
	}, [player, onComplete])

	async function handleOpenInBrowser() {
		try {
			const canOpen = await Linking.canOpenURL(videoUri)
			if (canOpen) {
				await Linking.openURL(videoUri)
				// After opening in browser, consider onboarding complete
				onComplete()
			} else {
				Alert.alert('Error', 'Cannot open video URL')
			}
		} catch (error) {
			console.error('Error opening URL:', error)
			Alert.alert('Error', 'Failed to open video')
		}
	}

	// Use web video player for web platform
	if (Platform.OS === 'web') {
		return (
			<WebVideoPlayer
				videoUri={videoUri}
				posterUri={posterUri}
				onComplete={onComplete}
			/>
		)
	}

	if (hasError) {
		return (
			<View style={[styles.container, { backgroundColor }]}>
				<ThemedText style={styles.errorText}>Video playback failed</ThemedText>
				<ThemedText style={styles.errorSubtext}>
					You can watch the video in your browser or skip to continue
				</ThemedText>
				<View style={styles.buttonContainer}>
					<ThemedText
						onPress={handleOpenInBrowser}
						style={[
							styles.linkButton,
							{
								color: resolvedTheme === 'light' ? Colors.light.tint : '#0a7ea4',
							},
						]}
					>
						Watch in browser
					</ThemedText>
					<ThemedText
						onPress={onComplete}
						style={[
							styles.linkButton,
							{
								color: resolvedTheme === 'light' ? Colors.light.tint : '#0a7ea4',
							},
						]}
					>
						Skip
					</ThemedText>
				</View>
			</View>
		)
	}

	return (
		<View style={[styles.container, { backgroundColor }]}>
			<VideoView
				player={player}
				style={styles.video}
				allowsFullscreen={false}
				allowsPictureInPicture={false}
				nativeControls={false}
				contentFit="contain"
			/>
			{status !== 'readyToPlay' && status !== 'playing' ? (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color={textColor} />
					<ThemedText style={styles.loadingText}>Loading video...</ThemedText>
				</View>
			) : null}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	video: {
		width: '100%',
		height: '100%',
	},
	loadingOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
	},
	loadingText: {
		marginTop: 16,
		textAlign: 'center',
	},
	errorText: {
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 8,
		textAlign: 'center',
	},
	errorSubtext: {
		fontSize: 14,
		opacity: 0.7,
		marginBottom: 24,
		textAlign: 'center',
		paddingHorizontal: 32,
	},
	buttonContainer: {
		gap: 16,
		alignItems: 'center',
	},
	linkButton: {
		fontSize: 16,
		fontWeight: '600',
		paddingVertical: 12,
		paddingHorizontal: 24,
	},
})
