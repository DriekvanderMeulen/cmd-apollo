import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { ItemDetailScreen } from '../screens/ItemDetailScreen'
import { BottomTabs } from './BottomTabs'
import { RootStackParamList } from '../types/navigation'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator(): React.JSX.Element {
	return (
		<Stack.Navigator>
			<Stack.Screen name="RootTabs" component={BottomTabs} options={{ headerShown: false }} />
			<Stack.Screen
				name="ItemDetail"
				component={ItemDetailScreen}
				options={{ title: 'Item Detail' }}
			/>
		</Stack.Navigator>
	)
}
