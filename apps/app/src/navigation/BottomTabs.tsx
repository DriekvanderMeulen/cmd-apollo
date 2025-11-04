import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

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
			}}
		>
			<Tab.Screen
				name="ScanInstructions"
				component={ScanInstructionsScreen}
				options={{ title: 'Scan' }}
			/>
			<Tab.Screen name="Library" component={LibraryScreen} options={{ title: 'Library' }} />
			<Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
		</Tab.Navigator>
	)
}
