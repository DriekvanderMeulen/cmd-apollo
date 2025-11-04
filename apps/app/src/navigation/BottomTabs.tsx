import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'

import { LibraryScreen } from '../screens/LibraryScreen'
import { ScanInstructionsScreen } from '../screens/ScanInstructionsScreen'
import { SettingsScreen } from '../screens/SettingsScreen'
import { BottomTabParamList } from '../types/navigation'

const Tab = createBottomTabNavigator<BottomTabParamList>()

export function BottomTabs(): React.JSX.Element {
	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarLabelStyle: {
					fontSize: 13,
					fontWeight: '600',
				},
				tabBarIcon: ({ color, size, focused }) => (
					// default icon when not overridden per screen
					<Ionicons name={focused ? 'ellipse' : 'ellipse-outline'} color={color} size={size} />
				),
			}}
		>
			<Tab.Screen
				name="ScanInstructions"
				component={ScanInstructionsScreen}
				options={{
					title: 'Scan',
					tabBarIcon: ({ color, size, focused }) => (
						<Ionicons name={focused ? 'scan' : 'scan-outline'} color={color} size={size} />
					),
				}}
			/>
			<Tab.Screen
				name="Library"
				component={LibraryScreen}
				options={{
					title: 'Library',
					tabBarIcon: ({ color, size, focused }) => (
						<Ionicons name={focused ? 'library' : 'library-outline'} color={color} size={size} />
					),
				}}
			/>
			<Tab.Screen
				name="Settings"
				component={SettingsScreen}
				options={{
					title: 'Settings',
					tabBarIcon: ({ color, size, focused }) => (
						<Ionicons name={focused ? 'settings' : 'settings-outline'} color={color} size={size} />
					),
				}}
			/>
		</Tab.Navigator>
	)
}
