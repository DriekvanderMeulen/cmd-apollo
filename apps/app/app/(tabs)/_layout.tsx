import { Tabs } from 'expo-router'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

import { HapticTab } from '@/components/haptic-tab'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'

export default function TabLayout() {
	const colorScheme = useColorScheme()

	return (
		<Tabs
			initialRouteName="scan"
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarLabelStyle: {
					fontSize: 13,
					fontWeight: '600',
				},
			}}
		>
			<Tabs.Screen
				name="library"
				options={{
					title: 'Library',
					tabBarIcon: ({ color, size, focused }) => (
						<Ionicons name={focused ? 'library' : 'library-outline'} color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="scan"
				options={{
					title: 'Scan',
					tabBarIcon: ({ color, size, focused }) => (
						<Ionicons name={focused ? 'scan' : 'scan-outline'} color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: 'Settings',
					tabBarIcon: ({ color, size, focused }) => (
						<Ionicons name={focused ? 'settings' : 'settings-outline'} color={color} size={size} />
					),
				}}
			/>
		</Tabs>
	)
}
