import { useEffect } from 'react'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Pressable } from 'react-native'

export default function HomeScreen() {
	const [permission, requestPermission] = useCameraPermissions()

	useEffect(function requestOnLoad() {
		if (!permission) return
		if (!permission.granted && !permission.canAskAgain) return
		if (!permission.granted) requestPermission()
	}, [permission, requestPermission])

	if (!permission) {
		return <ThemedView className="flex-1 bg-black" />
	}

	if (!permission.granted) {
		return (
			<ThemedView className="flex-1 items-center justify-center px-6">
				<ThemedText className="mb-4 text-center">
					We need your permission to use the camera
				</ThemedText>
				<Pressable
					onPress={requestPermission}
					className="rounded-md bg-black px-4 py-2 dark:bg-white"
				>
					<ThemedText>Grant permission</ThemedText>
				</Pressable>
			</ThemedView>
		)
	}

	return (
		<ThemedView className="flex-1 bg-black">
			<CameraView className="flex-1" active={true} />
		</ThemedView>
	)
}
