import 'react-native-gesture-handler'

import React, { useMemo } from 'react'
import { NavigationContainer, DarkTheme, DefaultTheme, type Theme as NavigationTheme } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Text, useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import ExploreScreen from './screens/explore'
import LibraryScreen from './screens/library'
import ItemScreen from './screens/item'
import { theme, selectThemeColor, getReadableTextColor } from '@repo/ui/theme'
import { linking } from './linking'

export type RootTabParamList = {
	Explore: undefined
	View: undefined
	Library: undefined
}

export type ViewStackParamList = {
	Item: { id?: string; slug?: string } | undefined
}

const Tab = createBottomTabNavigator<RootTabParamList>()
const Stack = createNativeStackNavigator<ViewStackParamList>()

function ViewStack(): JSX.Element {
	return (
		<Stack.Navigator>
			<Stack.Screen name='Item' component={ItemScreen} options={{ headerShown: false }} />
		</Stack.Navigator>
	)
}

function buildNavigationTheme(mode: 'light' | 'dark'): NavigationTheme {
	const base = mode === 'dark' ? DarkTheme : DefaultTheme
	return {
		...base,
		colors: {
			...base.colors,
			primary: selectThemeColor(mode, 'primary'),
			background: selectThemeColor(mode, 'background'),
			text: getReadableTextColor(mode),
			card: selectThemeColor(mode, 'background'),
			border: mode === 'dark' ? '#1F2937' : '#E5E7EB'
		}
	}
}

export default function AppRoot(): JSX.Element {
	const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light'
	const navTheme = useMemo(() => buildNavigationTheme(colorScheme), [colorScheme])

	return (
		<GestureHandlerRootView style={{ flex: 1, backgroundColor: selectThemeColor(colorScheme, 'background') }}>
			<NavigationContainer theme={navTheme} linking={linking}>
				<Tab.Navigator
					initialRouteName='View'
					screenOptions={({ route }) => ({
						headerShown: false,
						tabBarActiveTintColor: selectThemeColor(colorScheme, 'primary'),
						tabBarInactiveTintColor: theme.color.subtleText[colorScheme],
						tabBarStyle: {
							backgroundColor: selectThemeColor(colorScheme, 'background'),
							borderTopColor: colorScheme === 'dark' ? '#1F2937' : '#E5E7EB'
						},
						tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 12, fontWeight: '500' }}>{route.name}</Text>
					})}
				>
					<Tab.Screen name='Explore' component={ExploreScreen} />
					<Tab.Screen name='View' component={ViewStack} />
					<Tab.Screen name='Library' component={LibraryScreen} />
				</Tab.Navigator>
			</NavigationContainer>
		</GestureHandlerRootView>
	)
}

