import { useState, useRef, useEffect } from 'react'
import { View, StyleSheet, Pressable, ActivityIndicator, Alert, Platform } from 'react-native'
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av'
import * as Linking from 'expo-linking'
import { useTheme } from '@/src/providers/ThemeProvider'
import { Colors } from '@/constants/theme'
import { ThemedText } from '@/components/themed-text'

type VideoPlayerProps = {
	videoUri: string
	posterUri?: string | null
	style?: object
}

export function VideoPlayer({ videoUri, posterUri, style }: VideoPlayerProps) {
	const videoRef = useRef<Video>(null)
	const [status, setStatus] = useState<AVPlaybackStatus | null>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [isMuted, setIsMuted] = useState(true) // Default muted for European autoplay compliance
	const [isLoading, setIsLoading] = useState(true)
	const [hasError, setHasError] = useState(false)
	const webVideoRef = useRef<HTMLVideoElement | null>(null)
	const { resolvedTheme, isOLED } = useTheme()

	const backgroundColor =
		resolvedTheme === 'light' ? '#fff' : isOLED ? '#000000' : Colors.dark.background
	const textColor = resolvedTheme === 'light' ? '#000' : '#fff'

	useEffect(() => {
		if (Platform.OS !== 'web') {
			return
		}

		const video = webVideoRef.current
		if (!video) {
			return
		}

		const handleCanPlay = () => {
			setIsLoading(false)
			video.play().catch(() => {
				// Ignore autoplay block; user will tap to unmute
			})
		}

		const handleError = () => {
			setHasError(true)
			setIsLoading(false)
		}

		video.muted = isMuted
		video.addEventListener('canplay', handleCanPlay)
		video.addEventListener('error', handleError)

		return () => {
			video.removeEventListener('canplay', handleCanPlay)
			video.removeEventListener('error', handleError)
		}
	}, [isMuted])

	useEffect(() => {
		if (Platform.OS === 'web') {
			return
		}

		if (status?.isLoaded && !status.isPlaying && videoRef.current) {
			videoRef.current.playAsync().catch(() => {
				// Ignore autoplay failures on native
			})
		}
	}, [status])

	function handlePlaybackStatusUpdate(playbackStatus: AVPlaybackStatus) {
		setStatus(playbackStatus)

		if (playbackStatus.isLoaded) {
			setIsLoading(false)
			setIsPlaying(playbackStatus.isPlaying)
			setIsMuted(playbackStatus.isMuted)

			// Handle full screen updates
			if (playbackStatus.didJustFinish) {
				setIsPlaying(false)
			}
		} else if (playbackStatus.error) {
			setHasError(true)
			setIsLoading(false)
			console.error('Video playback error:', playbackStatus.error)
		}
	}

	async function handleMuteToggle() {
		try {
			if (Platform.OS === 'web') {
				const webVideo = webVideoRef.current
				if (!webVideo) {
					return
				}
				const nextMuted = !isMuted
				webVideo.muted = nextMuted
				setIsMuted(nextMuted)
				if (webVideo.paused) {
					webVideo.play().catch(() => {
						// Ignore autoplay errors after user interaction
					})
				}
				return
			}

			if (videoRef.current) {
				const nextMuted = !isMuted
				await videoRef.current.setIsMutedAsync(nextMuted)
				setIsMuted(nextMuted)

				if (!isPlaying) {
					await videoRef.current.playAsync()
				}
			}
		} catch (error) {
			console.error('Error toggling mute:', error)
		}
	}

	async function handleOpenInBrowser() {
		try {
			const canOpen = await Linking.canOpenURL(videoUri)
			if (canOpen) {
				await Linking.openURL(videoUri)
			} else {
				Alert.alert('Error', 'Cannot open video URL')
			}
		} catch (error) {
			console.error('Error opening URL:', error)
			Alert.alert('Error', 'Failed to open video')
		}
	}

	function handleVideoPress() {
		if (hasError) {
			return
		}
		handleMuteToggle()
	}

	if (hasError) {
		return (
			<View style={[styles.container, styles.errorContainer, style]}>
				<ThemedText style={styles.errorText}>Video playback failed</ThemedText>
				<Pressable
					onPress={handleOpenInBrowser}
					style={[
						styles.watchButton,
						{
							backgroundColor:
								resolvedTheme === 'light' ? Colors.light.tint : '#0a7ea4',
						},
					]}
				>
					<ThemedText style={styles.watchButtonText}>Watch video</ThemedText>
				</Pressable>
			</View>
		)
	}

	if (Platform.OS === 'web') {
		return (
			<View style={[styles.container, style]}>
				<View style={styles.videoWrapper}>
					{/* @ts-expect-error - HTML video element on web */}
					<video
						ref={webVideoRef}
						src={videoUri}
						poster={posterUri || undefined}
						style={styles.video}
						muted={isMuted}
						autoPlay
						playsInline
						controls={false}
					/>
					<Pressable style={StyleSheet.absoluteFill} onPress={handleMuteToggle} />
					{isMuted ? (
						<View style={styles.unmuteOverlay}>
							<ThemedText style={styles.unmuteText}>Click to unmute</ThemedText>
						</View>
					) : null}
					{isLoading ? (
						<View style={styles.loadingOverlay}>
							<ActivityIndicator size="large" color={textColor} />
						</View>
					) : null}
				</View>
			</View>
		)
	}

	return (
		<View style={[styles.container, style]}>
			<Pressable onPress={handleVideoPress} style={styles.videoWrapper}>
				<Video
					ref={videoRef}
					source={{ uri: videoUri }}
					posterSource={posterUri ? { uri: posterUri } : { uri: videoUri }}
					usePoster={true}
					shouldPlay={true}
					isMuted={isMuted}
					resizeMode={ResizeMode.CONTAIN}
					onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
					style={styles.video}
				/>
				{isLoading ? (
					<View style={styles.loadingOverlay}>
						<ActivityIndicator size="large" color={textColor} />
					</View>
				) : null}
				{isMuted ? (
					<View style={styles.unmuteOverlay}>
						<ThemedText style={styles.unmuteText}>Tap to unmute</ThemedText>
					</View>
				) : null}
			</Pressable>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		aspectRatio: 16 / 9,
		borderRadius: 8,
		overflow: 'hidden',
		backgroundColor: '#000',
		marginVertical: 16,
	},
	videoWrapper: {
		flex: 1,
		position: 'relative',
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
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	errorContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
		minHeight: 200,
	},
	errorText: {
		marginBottom: 16,
		textAlign: 'center',
	},
	watchButton: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
	},
	watchButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	unmuteOverlay: {
		position: 'absolute',
		bottom: 24,
		left: 0,
		right: 0,
		alignItems: 'center',
	},
	unmuteText: {
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		color: '#fff',
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 16,
		fontWeight: '600',
	},
})

