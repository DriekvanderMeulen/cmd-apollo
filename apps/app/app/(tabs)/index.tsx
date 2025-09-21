import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'

type CameraModule = {
	CameraView: any
	requestCameraPermissionsAsync?: () => Promise<{ status: 'granted' | 'denied' }>
}

export default function CameraScreen() {
	const [cameraMod, setCameraMod] = useState<CameraModule | null>(null)
	const [permission, setPermission] = useState<'loading' | 'granted' | 'denied'>('loading')
	const [available, setAvailable] = useState<boolean>(false)

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				const mod = (await import('expo-camera')) as unknown as CameraModule
				if (cancelled) return
				setCameraMod(mod)
				let isAvailable = false
				try {
					// If native module is not registered (Expo Go missing module), this returns false
					// or throws; both cases we treat as unavailable
					isAvailable = typeof (mod as any).CameraView?.isAvailableAsync === 'function'
						? await mod.CameraView.isAvailableAsync()
						: false
				} catch {
					isAvailable = false
				}
				if (cancelled) return
				setAvailable(isAvailable)
				if (mod.requestCameraPermissionsAsync) {
					const res = await mod.requestCameraPermissionsAsync()
					if (cancelled) return
					setPermission(res.status === 'granted' ? 'granted' : 'denied')
				} else {
					setPermission('granted')
				}
			} catch {
				if (!cancelled) setPermission('denied')
			}
		})()
		return () => {
			cancelled = true
		}
	}, [])

	if (!cameraMod) {
		return (
			<ThemedView className="flex-1 items-center justify-center">
				<ThemedText>Loading camera…</ThemedText>
			</ThemedView>
		)
	}

	if (!available || permission !== 'granted') {
		return (
			<ThemedView className="flex-1 items-center justify-center">
				<ThemedText>Camera not available or permission denied.</ThemedText>
			</ThemedView>
		)
	}

	const CameraViewComp: any = cameraMod.CameraView
	return (
		<View style={{ flex: 1 }}>
			<CameraViewComp style={{ flex: 1 }} facing="back" />
		</View>
	)
}
