import { useState, useRef, useEffect } from 'react'
import { View, StyleSheet, Pressable, ActivityIndicator, Alert, Platform } from 'react-native'
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av'
import { Ionicons } from '@expo/vector-icons'
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
	const [showControls, setShowControls] = useState(true)
	const { resolvedTheme, isOLED } = useTheme()

	const backgroundColor =
		resolvedTheme === 'light' ? '#fff' : isOLED ? '#000000' : Colors.dark.background
	const textColor = resolvedTheme === 'light' ? '#000' : '#fff'

	useEffect(() => {
		// Hide controls after 3 seconds of inactivity
		if (isPlaying && showControls) {
			const timer = setTimeout(() => {
				setShowControls(false)
			}, 3000)
			return () => clearTimeout(timer)
		}
	}, [isPlaying, showControls])

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

	async function handlePlayPause() {
		try {
			if (videoRef.current) {
				if (isPlaying) {
					await videoRef.current.pauseAsync()
				} else {
					// Unmute when user starts playback (user interaction)
					if (isMuted) {
						await videoRef.current.setIsMutedAsync(false)
					}
					await videoRef.current.playAsync()
				}
			}
		} catch (error) {
			console.error('Error toggling playback:', error)
			setHasError(true)
		}
	}

	async function handleMuteToggle() {
		try {
			if (videoRef.current) {
				await videoRef.current.setIsMutedAsync(!isMuted)
			}
		} catch (error) {
			console.error('Error toggling mute:', error)
		}
	}

	async function handleFullScreen() {
		try {
			if (videoRef.current) {
				await videoRef.current.presentFullscreenPlayer()
			}
		} catch (error) {
			console.error('Error entering full screen:', error)
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
		if (!isPlaying && !hasError) {
			handlePlayPause()
		}
		setShowControls(true)
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

	return (
		<View style={[styles.container, style]}>
			<Pressable onPress={handleVideoPress} style={styles.videoWrapper}>
				<Video
					ref={videoRef}
					source={{ uri: videoUri }}
					posterSource={posterUri ? { uri: posterUri } : { uri: videoUri }}
					usePoster={true}
					shouldPlay={false}
					isMuted={isMuted}
					resizeMode={ResizeMode.CONTAIN}
					onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
					onFullscreenUpdate={(status) => {
						// Handle full screen state changes
						if (status.fullscreenUpdate === 1) {
							// Entered full screen
						} else if (status.fullscreenUpdate === 2) {
							// Exited full screen - resume or stop based on user action
							if (videoRef.current && status.status?.isLoaded) {
								// Resume playback if it was playing before
								if (status.status.isPlaying) {
									videoRef.current.playAsync().catch(console.error)
								}
							}
						}
					}}
					style={styles.video}
				/>
				{isLoading ? (
					<View style={styles.loadingOverlay}>
						<ActivityIndicator size="large" color={textColor} />
					</View>
				) : null}
				{(showControls || !isPlaying) && !isLoading ? (
					<View style={styles.controlsOverlay}>
						<Pressable
							onPress={handlePlayPause}
							style={styles.controlButton}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Ionicons
								name={isPlaying ? 'pause' : 'play'}
								size={32}
								color="#fff"
							/>
						</Pressable>
					</View>
				) : null}
			</Pressable>
			{!isLoading ? (
				<View style={styles.bottomControls}>
					<Pressable
						onPress={handleMuteToggle}
						style={styles.controlButton}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Ionicons
							name={isMuted ? 'volume-mute' : 'volume-high'}
							size={24}
							color={textColor}
						/>
					</Pressable>
					{Platform.OS !== 'web' ? (
						<Pressable
							onPress={handleFullScreen}
							style={styles.controlButton}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Ionicons name="expand" size={24} color={textColor} />
						</Pressable>
					) : null}
				</View>
			) : null}
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
	controlsOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
	},
	controlButton: {
		padding: 8,
		borderRadius: 24,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	bottomControls: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 12,
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
})

