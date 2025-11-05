import React from 'react'
import { StyleSheet, TextInput, View, Pressable } from 'react-native'
import { useTheme } from '@/src/providers/ThemeProvider'
import { Colors } from '@/constants/theme'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

type SearchBarProps = {
	value: string
	onChangeText: (text: string) => void
	placeholder?: string
}

export function SearchBar({
	value,
	onChangeText,
	placeholder = 'Search...',
}: SearchBarProps): React.JSX.Element {
	const { resolvedTheme, isOLED } = useTheme()
	const isDark = resolvedTheme === 'dark'

	return (
		<View
			style={[
				styles.container,
				{
					backgroundColor: isDark ? (isOLED ? '#000000' : '#1f1f1f') : '#f5f5f5',
					borderColor: isDark ? '#333' : '#e0e0e0',
				},
			]}
		>
			<MaterialIcons
				name="search"
				size={20}
				color={isDark ? Colors.dark.icon : Colors.light.icon}
			/>
			<TextInput
				style={[
					styles.input,
					{
						color: isDark ? Colors.dark.text : Colors.light.text,
					},
				]}
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={isDark ? Colors.dark.icon : Colors.light.icon}
				autoCapitalize="none"
				autoCorrect={false}
				showSoftInputOnFocus={true}
				returnKeyType="search"
			/>
			{value.length > 0 ? (
				<Pressable onPress={() => onChangeText('')}>
					<MaterialIcons
						name="close"
						size={20}
						color={isDark ? Colors.dark.icon : Colors.light.icon}
					/>
				</Pressable>
			) : null}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 8,
		borderWidth: 1,
		gap: 8,
	},
	input: {
		flex: 1,
		fontSize: 16,
		padding: 0,
	},
})

