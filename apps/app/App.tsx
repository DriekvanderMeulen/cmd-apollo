import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'

import { RootNavigator } from './src/navigation/RootNavigator'

export default function App(): React.JSX.Element {
	return (
		<SafeAreaProvider>
			<NavigationContainer>
				<StatusBar style="dark" />
				<RootNavigator />
			</NavigationContainer>
		</SafeAreaProvider>
	)
}
