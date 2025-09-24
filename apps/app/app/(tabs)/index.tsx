import { useEffect, useState } from 'react'
import { View, Pressable, Linking } from 'react-native'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'

type CameraModule = {
	CameraView: any
	Camera?: {
		requestCameraPermissionsAsync?: () => Promise<{ status: 'granted' | 'denied' | 'undetermined' }>
	}
	requestCameraPermissionsAsync?: () => Promise<{ status: 'granted' | 'denied' | 'undetermined' }>
}

export default function CameraScreen() {
	const [cameraMod, setCameraMod] = useState<CameraModule | null>(null)
	const [permission, setPermission] = useState<'loading' | 'granted' | 'denied'>('loading')
	const [available, setAvailable] = useState<boolean>(false)

	async function requestPermission() {
		try {
			// Prefer namespaced API if available, else fallback to module-level
			const req = cameraMod?.Camera?.requestCameraPermissionsAsync
				|| cameraMod?.requestCameraPermissionsAsync
			if (!req) {
				setPermission('denied')
				return
			}
			const res = await req()
			const next = res.status === 'granted' ? 'granted' : 'denied'
			setPermission(next)
			if (next !== 'granted') {
				try {
					await Linking.openSettings()
				} catch {}
			}
		} catch {
			setPermission('denied')
		}
	}

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				const mod = (await import('expo-camera')) as unknown as CameraModule
				if (cancelled) return
				setCameraMod(mod)
				try { console.log('[camera] exports', Object.keys(mod || {})) } catch {}
				let isAvailable = false
				try {
					// Prefer native availability probe when present; otherwise, treat presence of CameraView as available
					const hasProbe = typeof (mod as any).CameraView?.isAvailableAsync === 'function'
					isAvailable = hasProbe
						? await (mod as any).CameraView.isAvailableAsync()
						: Boolean((mod as any).CameraView || (mod as any).Camera)
				} catch {
					isAvailable = false
				}
				if (cancelled) return
				setAvailable(isAvailable)
				// Defer permission request until user activation
				setPermission('denied')
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

	if (!available) {
		return (
			<ThemedView className="flex-1 items-center justify-center px-6">
				<ThemedText className="text-center">Camera not available on this device.</ThemedText>
			</ThemedView>
		)
	}

	if (permission !== 'granted') {
		return (
			<ThemedView className="flex-1 items-center justify-center px-6">
				<ThemedText className="text-center">Activate the camera to continue.</ThemedText>
				<Pressable onPress={requestPermission} className="mt-4 rounded-md bg-white/10 px-4 py-2">
					<ThemedText>Activate camera</ThemedText>
				</Pressable>
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
