import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Pressable, Linking } from 'react-native'

export default function HomeScreen() {
	const [permission, requestPermission] = useCameraPermissions()

	const isGranted = permission?.granted ?? false
	const canAskAgain = permission?.canAskAgain ?? true

	if (!isGranted) {
		return (
			<ThemedView className="flex-1 items-center justify-center px-6">
				<ThemedText className="mb-4 text-center">
					We need your permission to use the camera
				</ThemedText>
				{canAskAgain ? (
					<Pressable
						onPress={requestPermission}
						className="rounded-md px-4 py-2 bg-neutral-900 dark:bg-white"
					>
						<ThemedText className="text-white dark:text-black">
							Grant permission
						</ThemedText>
					</Pressable>
				) : (
					<Pressable
						onPress={Linking.openSettings}
						className="rounded-md px-4 py-2 bg-neutral-900 dark:bg-white"
					>
						<ThemedText className="text-white dark:text-black">
							Open settings
						</ThemedText>
					</Pressable>
				)}
			</ThemedView>
		)
	}

	return (
		<ThemedView className="flex-1">
			<CameraView style={{ flex: 1 }} active={true} facing="back" />
		</ThemedView>
	)
}
