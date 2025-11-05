import React, { useState } from 'react'
import { StyleSheet, Pressable, Modal, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import type { SortOption } from '@/lib/api'

export type { SortOption }

type SortSelectorProps = {
	value: SortOption
	onChange: (value: SortOption) => void
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
	{ value: 'newest', label: 'Newest' },
	{ value: 'alphabetical', label: 'Alphabetical (A–Z)' },
]

export function SortSelector({ value, onChange }: SortSelectorProps): React.JSX.Element {
	const [isOpen, setIsOpen] = useState(false)
	const theme = useColorScheme() ?? 'light'
	const selectedOption = SORT_OPTIONS.find((option) => option.value === value) ?? SORT_OPTIONS[0]

	function handleSelect(optionValue: SortOption): void {
		onChange(optionValue)
		setIsOpen(false)
	}

	return (
		<>
			<Pressable
				style={[styles.trigger, { borderColor: theme === 'light' ? '#e0e0e0' : '#333' }]}
				onPress={() => setIsOpen(true)}
			>
				<ThemedText style={styles.triggerText}>Sort: {selectedOption.label}</ThemedText>
				<IconSymbol
					name="chevron.down"
					size={16}
					weight="medium"
					color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
				/>
			</Pressable>

			<Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setIsOpen(false)}
				>
					<View onStartShouldSetResponder={() => true}>
						<ThemedView style={styles.modalContent}>
							{SORT_OPTIONS.map((option) => (
								<TouchableOpacity
									key={option.value}
									style={[
										styles.option,
										value === option.value ? styles.optionSelected : undefined,
									]}
									onPress={() => handleSelect(option.value)}
								>
									<ThemedText
										type={value === option.value ? 'defaultSemiBold' : 'default'}
										style={value === option.value ? styles.optionTextSelected : undefined}
									>
										{option.label}
									</ThemedText>
									{value === option.value ? (
										<IconSymbol
											name="checkmark"
											size={18}
											weight="medium"
											color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
										/>
									) : null}
								</TouchableOpacity>
							))}
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
		minWidth: 180,
	},
	triggerText: {
		fontSize: 14,
		marginRight: 8,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingVertical: 8,
		minWidth: 240,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 8,
		elevation: 5,
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

