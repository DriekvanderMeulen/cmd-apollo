import React, { useCallback } from 'react'
import { View, StyleSheet, useColorScheme } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useRoute, type RouteProp } from '@react-navigation/native'
import { PanGestureHandler, State, type PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler'
import type { ViewStackParamList } from '../app'
import { useItem } from '../state/useItem'
import { VideoSurface } from '../components/item/video-surface'
import { DetailsOverlay } from '../components/item/details-overlay'
import { LoadingIndicator } from '../components/item/loading-indicator'
import { ErrorSheet } from '../components/item/error-sheet'

type ItemRoute = RouteProp<ViewStackParamList, 'Item'>

export default function ItemScreen(): JSX.Element {
	const route = useRoute<ItemRoute>()
	const params = route.params ?? {}
	const mode = useColorScheme() === 'dark' ? 'dark' : 'light'
	const {
		status,
		item,
		iteration,
		videoUri,
		posterUri,
		showDetails,
		hasNext,
		hasPrevious,
		isEmpty,
		errorMessage,
		onVideoEnd,
		onSwipeDown,
		onVideoError,
		goToNext,
		goToPrevious,
		retry
	} = useItem(params)

	const handleStateChange = useCallback(
		(event: PanGestureHandlerStateChangeEvent) => {
			if (event.nativeEvent.state === State.END && event.nativeEvent.translationY > 48) {
				onSwipeDown()
			}
		},
		[onSwipeDown]
	)

	return (
		<View style={styles.container}>
			<StatusBar hidden />
			<PanGestureHandler onHandlerStateChange={handleStateChange}>
				<View style={styles.content}>
					<VideoSurface
						videoUri={videoUri}
						posterUri={posterUri}
						isPlaying={status === 'video'}
						onPlaybackStatusUpdate={(playback) => {
							if (!playback.isLoaded) {
								if ('error' in playback) {
									onVideoError()
								}
								return
							}
							if (playback.didJustFinish) {
								onVideoEnd((playback.durationMillis ?? 0) / 1000)
							}
						}}
						mode={mode}
					/>
					<DetailsOverlay
						visible={showDetails}
						mode={mode}
						item={item}
						iteration={iteration}
						hasNext={hasNext}
						hasPrevious={hasPrevious}
						onNext={goToNext}
						onPrevious={goToPrevious}
						isEmpty={isEmpty}
					/>
					{status === 'loading' ? <LoadingIndicator /> : null}
					{status === 'error' && errorMessage ? (
						<ErrorSheet message={errorMessage} onRetry={retry} itemId={item?.id ?? params.id} slug={item?.slug ?? params.slug} />
					) : null}
				</View>
			</PanGestureHandler>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000000'
	},
	content: {
		flex: 1
	}
})

