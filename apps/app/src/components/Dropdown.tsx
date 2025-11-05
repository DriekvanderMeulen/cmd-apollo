import React, { useState } from 'react'
import { StyleSheet, Pressable, Modal, TouchableOpacity, View, ScrollView } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'

type DropdownOption<T> = {
	value: T
	label: string
}

type DropdownProps<T> = {
	value: T
	options: Array<DropdownOption<T>>
	onChange: (value: T) => void
	placeholder?: string
	triggerStyle?: object
}

export function Dropdown<T>({
	value,
	options,
	onChange,
	placeholder,
	triggerStyle,
}: DropdownProps<T>): React.JSX.Element {
	const [isOpen, setIsOpen] = useState(false)
	const theme = useColorScheme() ?? 'light'

	const selectedOption = options.find((option) => option.value === value)

	function handleSelect(optionValue: T): void {
		onChange(optionValue)
		setIsOpen(false)
	}

	return (
		<>
			<Pressable
				style={[
					styles.trigger,
					{ borderColor: theme === 'light' ? '#e0e0e0' : '#333' },
					triggerStyle,
				]}
				onPress={() => setIsOpen(true)}
			>
				<ThemedText style={styles.triggerText} numberOfLines={1}>
					{selectedOption ? selectedOption.label : placeholder ?? 'Select...'}
				</ThemedText>
				<IconSymbol
					name="chevron.down"
					size={16}
					weight="medium"
					color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
				/>
			</Pressable>

			<Modal
				visible={isOpen}
				transparent
				animationType="fade"
				onRequestClose={() => setIsOpen(false)}
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setIsOpen(false)}
				>
					<View onStartShouldSetResponder={() => true}>
						<ThemedView style={styles.dropdown}>
							<ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
								{options.map((option) => {
									const isSelected = value === option.value
									return (
										<TouchableOpacity
											key={String(option.value)}
											style={[styles.option, isSelected ? styles.optionSelected : undefined]}
											onPress={() => handleSelect(option.value)}
										>
											<ThemedText
												type={isSelected ? 'defaultSemiBold' : 'default'}
												style={isSelected ? styles.optionTextSelected : undefined}
											>
												{option.label}
											</ThemedText>
											{isSelected ? (
												<IconSymbol
													name="checkmark"
													size={18}
													weight="medium"
													color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
												/>
											) : null}
										</TouchableOpacity>
									)
								})}
							</ScrollView>
						</ThemedView>
					</View>
				</TouchableOpacity>
			</Modal>
		</>
	)
}

const styles = StyleSheet.create({
	trigger: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
		minWidth: 120,
	},
	triggerText: {
		fontSize: 14,
		marginRight: 8,
		flex: 1,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
		justifyContent: 'flex-start',
		alignItems: 'center',
		paddingTop: 100,
	},
	dropdown: {
		backgroundColor: '#fff',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#e0e0e0',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 8,
		minWidth: 200,
		maxWidth: '90%',
		maxHeight: 400,
	},
	optionsList: {
		maxHeight: 400,
	},
	option: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	optionSelected: {
		backgroundColor: '#f5f5f5',
	},
	optionTextSelected: {
		color: '#0a7ea4',
	},
})

