import React, { useState } from 'react'
import { StyleSheet, Pressable, Modal, TouchableOpacity, View, ScrollView, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'

type Option = {
	id: number
	title: string
}

type MultiSelectDropdownProps<T extends Option> = {
	label: string
	queryKey: string
	fetchFn: () => Promise<Array<T>>
	selectedIds: Array<number>
	onChange: (ids: Array<number>) => void
	triggerStyle?: object
}

export function MultiSelectDropdown<T extends Option>({
	label,
	queryKey,
	fetchFn,
	selectedIds,
	onChange,
	triggerStyle,
}: MultiSelectDropdownProps<T>): React.JSX.Element {
	const [isOpen, setIsOpen] = useState(false)
	const theme = useColorScheme() ?? 'light'

	const { data: options, isLoading } = useQuery({
		queryKey: [queryKey],
		queryFn: fetchFn,
		staleTime: 24 * 60 * 60 * 1000, // 24 hours
		gcTime: 24 * 60 * 60 * 1000, // 24 hours (formerly cacheTime)
	})

	function handleToggle(id: number): void {
		if (selectedIds.includes(id)) {
			onChange(selectedIds.filter((selectedId) => selectedId !== id))
		} else {
			onChange([...selectedIds, id])
		}
	}

	function handleClearAll(): void {
		onChange([])
	}

	const selectedCount = selectedIds.length
	let displayText = `All ${label}`
	if (selectedCount === 1) {
		const selected = options?.find((o) => o.id === selectedIds[0])
		displayText = selected?.title ?? `1 ${label}`
	} else if (selectedCount === 2) {
		const selected = selectedIds
			.map((id) => options?.find((o) => o.id === id)?.title)
			.filter(Boolean)
			.join(', ')
		displayText = selected || `${selectedCount} ${label}`
	} else if (selectedCount > 2) {
		displayText = `${selectedCount} ${label}`
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
					{displayText}
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
							<View style={styles.dropdownHeader}>
								<ThemedText type="defaultSemiBold" style={styles.dropdownTitle}>
									Select {label}
								</ThemedText>
								{selectedCount > 0 ? (
									<TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
										<ThemedText style={styles.clearButtonText}>Clear</ThemedText>
									</TouchableOpacity>
								) : null}
							</View>
							{isLoading ? (
								<View style={styles.loadingContainer}>
									<ActivityIndicator size="small" />
								</View>
							) : (
								<ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
									{options?.map((option) => {
										const isSelected = selectedIds.includes(option.id)
										return (
											<TouchableOpacity
												key={option.id}
												style={[styles.option, isSelected ? styles.optionSelected : undefined]}
												onPress={() => handleToggle(option.id)}
											>
												<ThemedText
													type={isSelected ? 'defaultSemiBold' : 'default'}
													style={isSelected ? styles.optionTextSelected : undefined}
												>
													{option.title}
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
							)}
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
		flex: 1,
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
		minWidth: 280,
		maxWidth: '90%',
		maxHeight: 400,
	},
	dropdownHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#e0e0e0',
	},
	dropdownTitle: {
		fontSize: 16,
	},
	clearButton: {
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	clearButtonText: {
		fontSize: 14,
		color: '#0a7ea4',
	},
	optionsList: {
		maxHeight: 320,
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
	loadingContainer: {
		paddingVertical: 24,
		alignItems: 'center',
	},
})

