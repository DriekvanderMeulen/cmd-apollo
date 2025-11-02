import React, { useEffect, useRef } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { Video, ResizeMode, type AVPlaybackStatus } from 'expo-av'

interface VideoSurfaceProps {
	videoUri: string | null
	posterUri: string | null
	isPlaying: boolean
	onPlaybackStatusUpdate(status: AVPlaybackStatus): void
	mode: 'light' | 'dark'
}

export function VideoSurface(props: VideoSurfaceProps): JSX.Element {
	const { videoUri, posterUri, isPlaying, onPlaybackStatusUpdate, mode } = props
	const videoRef = useRef<Video | null>(null)

	useEffect(() => {
		const instance = videoRef.current
		if (!instance) {
			return
		}
		if (!videoUri) {
			instance.stopAsync().catch(() => {
				// ignore
			})
			return
		}
		if (isPlaying) {
			instance.playAsync().catch(() => {
				// ignore
			})
			return
		}
		instance.pauseAsync().catch(() => {
			// ignore
		})
	}, [isPlaying, videoUri])

	if (!videoUri) {
		return (
			<View style={styles.posterOnly}>
				{posterUri ? <Image source={{ uri: posterUri }} style={styles.posterImage} resizeMode='cover' /> : null}
				<View style={styles.posterOverlay}>
					<Text style={styles.posterText}>Poster preview</Text>
				</View>
			</View>
		)
	}

	return (
		<Video
			ref={(instance) => {
				videoRef.current = instance
			}}
			source={{ uri: videoUri }}
			style={StyleSheet.absoluteFill}
			resizeMode={ResizeMode.COVER}
			shouldPlay={isPlaying}
			isLooping={false}
			useNativeControls={false}
			posterSource={posterUri ? { uri: posterUri } : undefined}
			posterStyle={styles.posterImage}
			onPlaybackStatusUpdate={onPlaybackStatusUpdate}
		/>
	)
}

const styles = StyleSheet.create({
	posterOnly: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: '#000000'
	},
	posterImage: {
		width: '100%',
		height: '100%'
	},
	posterOverlay: {
		position: 'absolute',
		bottom: 48,
		left: 24,
		right: 24,
		backgroundColor: 'rgba(0,0,0,0.4)',
		padding: 12,
		borderRadius: 12
	},
	posterText: {
		fontSize: 16,
		fontWeight: '600',
		textAlign: 'center',
		color: '#FFFFFF'
	}
})

