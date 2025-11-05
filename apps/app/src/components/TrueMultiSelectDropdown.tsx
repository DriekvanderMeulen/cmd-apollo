import React, { useState, useRef } from 'react'
import { StyleSheet, Pressable, TouchableOpacity, View, ScrollView, ActivityIndicator } from 'react-native'
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

type TrueMultiSelectDropdownProps<T extends Option> = {
	label: string
	queryKey: string
	fetchFn: () => Promise<Array<T>>
	selectedIds: Array<number>
	onChange: (ids: Array<number>) => void
	triggerStyle?: object
}

export function TrueMultiSelectDropdown<T extends Option>({
	label,
	queryKey,
	fetchFn,
	selectedIds,
	onChange,
	triggerStyle,
}: TrueMultiSelectDropdownProps<T>): React.JSX.Element {
	const [isOpen, setIsOpen] = useState(false)
	const [triggerHeight, setTriggerHeight] = useState(0)
	const triggerRef = useRef<View>(null)
	const theme = useColorScheme() ?? 'light'

	const { data: options, isLoading, error } = useQuery({
		queryKey: [queryKey],
		queryFn: fetchFn,
		staleTime: 24 * 60 * 60 * 1000, // 24 hours
		gcTime: 24 * 60 * 60 * 1000, // 24 hours
	})

	function handlePress(): void {
		setIsOpen((prev) => !prev)
	}

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

	const selectedItems = selectedIds
		.map((id) => options?.find((o) => o.id === id))
		.filter(Boolean) as Array<T>

	const selectedCount = selectedIds.length
	const placeholder = `Select ${label}`

	return (
		<View style={styles.container} collapsable={false}>
			<Pressable
				ref={triggerRef}
				onLayout={(e) => {
					setTriggerHeight(e.nativeEvent.layout.height)
				}}
				style={[
					styles.trigger,
					{ borderColor: theme === 'light' ? '#e0e0e0' : '#333' },
					triggerStyle,
				]}
				onPress={handlePress}
				accessibilityRole="button"
				accessibilityLabel={selectedCount > 0 ? `${selectedCount} ${label} selected` : placeholder}
				accessibilityState={{ expanded: isOpen }}
			>
				<View style={styles.triggerContent}>
					{selectedCount === 0 ? (
						<ThemedText style={styles.placeholderText}>{placeholder}</ThemedText>
					) : selectedCount <= 2 ? (
						<View style={styles.chipsContainer}>
							{selectedItems.map((item) => (
								<View key={item.id} style={styles.chip}>
									<ThemedText style={styles.chipText} numberOfLines={1}>
										{item.title}
									</ThemedText>
								</View>
							))}
						</View>
					) : (
						<View style={styles.chipsContainer}>
							<View style={styles.chip}>
								<ThemedText style={styles.chipText} numberOfLines={1}>
									{selectedItems[0].title}
								</ThemedText>
							</View>
							<ThemedText style={styles.moreText}>+{selectedCount - 1} more</ThemedText>
						</View>
					)}
				</View>
				<IconSymbol
					name={isOpen ? 'chevron.up' : 'chevron.down'}
					size={16}
					weight="medium"
					color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
				/>
			</Pressable>

			{isOpen ? (
				<>
					<TouchableOpacity
						style={styles.backdrop}
						activeOpacity={1}
						onPress={() => setIsOpen(false)}
					/>
					<View
						style={[
							styles.dropdownContainer,
							{ top: triggerHeight + 4 },
						]}
						onStartShouldSetResponder={() => true}
					>
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
						) : error ? (
							<View style={styles.loadingContainer}>
								<ThemedText style={styles.errorText}>Failed to load</ThemedText>
							</View>
						) : options && options.length > 0 ? (
							<ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
								{options.map((option) => {
									const isSelected = selectedIds.includes(option.id)
									return (
										<TouchableOpacity
											key={option.id}
											style={[styles.option, isSelected ? styles.optionSelected : undefined]}
											onPress={() => handleToggle(option.id)}
											accessibilityRole="checkbox"
											accessibilityState={{ checked: isSelected }}
											accessibilityLabel={option.title}
										>
											<ThemedText
												type={isSelected ? 'defaultSemiBold' : 'default'}
												style={[styles.optionText, isSelected ? styles.optionTextSelected : undefined]}
												numberOfLines={1}
											>
												{option.title}
											</ThemedText>
											<View style={styles.checkboxContainer}>
												{isSelected ? (
													<IconSymbol
														name="checkmark"
														size={20}
														weight="medium"
														color={theme === 'light' ? '#0a7ea4' : '#0a7ea4'}
													/>
												) : (
													<View style={styles.checkboxEmpty} />
												)}
											</View>
										</TouchableOpacity>
									)
								})}
							</ScrollView>
						) : (
							<View style={styles.loadingContainer}>
								<ThemedText>No options available</ThemedText>
							</View>
						)}
						</ThemedView>
					</View>
				</>
			) : null}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'relative',
		zIndex: 1000,
	},
	trigger: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 12,
		paddingVertical: 12,
		borderRadius: 8,
		borderWidth: 1,
		flex: 1,
		minWidth: 120,
		minHeight: 44,
	},
	triggerContent: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 8,
		flexWrap: 'wrap',
	},
	placeholderText: {
		fontSize: 14,
		opacity: 0.6,
	},
	chipsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		flex: 1,
	},
	chip: {
		backgroundColor: '#e8f4f8',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
		maxWidth: '100%',
		marginRight: 6,
		marginBottom: 2,
	},
	chipText: {
		fontSize: 13,
		color: '#0a7ea4',
	},
	moreText: {
		fontSize: 13,
		color: '#666',
		marginLeft: 6,
	},
	backdrop: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 999,
	},
	dropdownContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		zIndex: 1001,
	},
	dropdown: {
		backgroundColor: '#fff',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#e0e0e0',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 8,
		maxHeight: 300,
		overflow: 'hidden',
	},
	dropdownHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#e0e0e0',
	},
	dropdownTitle: {
		fontSize: 14,
	},
	clearButton: {
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	clearButtonText: {
		fontSize: 12,
		color: '#0a7ea4',
	},
	optionsList: {
		maxHeight: 250,
	},
	option: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
		minHeight: 44,
	},
	optionSelected: {
		backgroundColor: '#f0f8fa',
	},
	optionText: {
		flex: 1,
		fontSize: 14,
		marginRight: 12,
	},
	optionTextSelected: {
		color: '#0a7ea4',
	},
	checkboxContainer: {
		width: 24,
		height: 24,
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
	},
	checkboxEmpty: {
		width: 20,
		height: 20,
		borderRadius: 4,
		borderWidth: 2,
		borderColor: '#ddd',
	},
	loadingContainer: {
		paddingVertical: 24,
		alignItems: 'center',
	},
	errorText: {
		color: '#ff3b30',
		fontSize: 12,
	},
})

