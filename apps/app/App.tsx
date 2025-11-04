import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'

import { RootNavigator } from './src/navigation/RootNavigator'
import { QueryProvider } from './src/providers/QueryProvider'

export default function App(): React.JSX.Element {
    const linking = {
        prefixes: ['https://cms.apolloview.app', 'apolloview://'],
        config: {
            screens: {
                ItemDetail: 'object/:publicId',
            },
        },
    }
	return (
		<SafeAreaProvider>
			<QueryProvider>
				<NavigationContainer linking={linking}>
					<StatusBar style="dark" />
					<RootNavigator />
				</NavigationContainer>
			</QueryProvider>
		</SafeAreaProvider>
	)
}
