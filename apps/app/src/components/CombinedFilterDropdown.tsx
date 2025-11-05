import React, { useState, useRef, useEffect } from 'react'
import { StyleSheet, Pressable, TouchableOpacity, View, ScrollView, ActivityIndicator, Dimensions } from 'react-native'
import { useQuery } from '@tanstack/react-query'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Colors } from '@/constants/theme'
import { useTheme } from '@/src/providers/ThemeProvider'
import { fetchCollections, fetchCategories, type Collection, type Category } from '@/lib/api'

type CombinedFilterDropdownProps = {
	selectedCollectionIds: Array<number>
	selectedCategoryIds: Array<number>
	onCollectionChange: (ids: Array<number>) => void
	onCategoryChange: (ids: Array<number>) => void
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

export function CombinedFilterDropdown({
	selectedCollectionIds,
	selectedCategoryIds,
	onCollectionChange,
	onCategoryChange,
	isOpen,
	onOpenChange,
}: CombinedFilterDropdownProps): React.JSX.Element {
	const [triggerHeight, setTriggerHeight] = useState(0)
	const [triggerX, setTriggerX] = useState(0)
	const triggerRef = useRef<View>(null)
	const { resolvedTheme: theme, isOLED } = useTheme()

	const { data: collections, isLoading: isLoadingCollections } = useQuery({
		queryKey: ['collections'],
		queryFn: fetchCollections,
		staleTime: 24 * 60 * 60 * 1000,
		gcTime: 24 * 60 * 60 * 1000,
	})

	const { data: categories, isLoading: isLoadingCategories } = useQuery({
		queryKey: ['categories'],
		queryFn: fetchCategories,
		staleTime: 24 * 60 * 60 * 1000,
		gcTime: 24 * 60 * 60 * 1000,
	})

	function handleToggleCollection(id: number): void {
		if (selectedCollectionIds.includes(id)) {
			onCollectionChange(selectedCollectionIds.filter((selectedId) => selectedId !== id))
		} else {
			onCollectionChange([...selectedCollectionIds, id])
		}
	}

	function handleToggleCategory(id: number): void {
		if (selectedCategoryIds.includes(id)) {
			onCategoryChange(selectedCategoryIds.filter((selectedId) => selectedId !== id))
		} else {
			onCategoryChange([...selectedCategoryIds, id])
		}
	}

	function handleClearAll(): void {
		onCollectionChange([])
		onCategoryChange([])
	}

	const selectedCollections = selectedCollectionIds
		.map((id) => collections?.find((c) => c.id === id))
		.filter(Boolean) as Array<Collection>

	const selectedCategories = selectedCategoryIds
		.map((id) => categories?.find((c) => c.id === id))
		.filter(Boolean) as Array<Category>

	const totalSelected = selectedCollectionIds.length + selectedCategoryIds.length
	const placeholder = 'Filter'
	const screenWidth = Dimensions.get('window').width

	function measureTrigger(): void {
		triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
			setTriggerX(pageX)
		})
	}

	useEffect(() => {
		if (isOpen) {
			measureTrigger()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen])

	return (
		<View style={styles.container} collapsable={false}>
			<Pressable
				ref={triggerRef}
				onLayout={(e) => {
					setTriggerHeight(e.nativeEvent.layout.height)
					measureTrigger()
				}}
				style={[
					styles.trigger,
					{
						backgroundColor:
							theme === 'light' ? '#fff' : isOLED ? '#000000' : Colors.dark.background,
						borderColor: theme === 'light' ? '#e0e0e0' : '#333',
					},
				]}
				onPress={() => onOpenChange(!isOpen)}
				accessibilityRole="button"
				accessibilityLabel={totalSelected > 0 ? `${totalSelected} filters selected` : placeholder}
				accessibilityState={{ expanded: isOpen }}
			>
				<View style={styles.triggerContent}>
					<IconSymbol
						name="line.3.horizontal.decrease"
						size={16}
						weight="medium"
						color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
					/>
					{totalSelected === 0 ? (
						<ThemedText style={styles.placeholderText}>{placeholder}</ThemedText>
					) : (
						<ThemedText style={styles.selectedText}>{totalSelected} selected</ThemedText>
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
						onPress={() => onOpenChange(false)}
					/>
					<View
						style={[
							styles.dropdownContainer,
							{ 
								top: triggerHeight + 4,
								width: screenWidth - 48, // Account for ScreenContainer padding (24 * 2)
								left: 24 - triggerX, // Center on screen by offsetting from trigger position
							},
						]}
						onStartShouldSetResponder={() => true}
					>
						<ThemedView
							style={[
								styles.dropdown,
							{
								backgroundColor:
									theme === 'light' ? '#fff' : isOLED ? '#000000' : Colors.dark.background,
								borderColor: theme === 'light' ? '#e0e0e0' : '#333',
							},
							]}
						>
							<View
								style={[
									styles.dropdownHeader,
									{ borderBottomColor: theme === 'light' ? '#e0e0e0' : '#333' },
								]}
							>
								<ThemedText type="defaultSemiBold" style={styles.dropdownTitle}>
									Filters
								</ThemedText>
								{totalSelected > 0 ? (
									<TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
										<ThemedText style={styles.clearButtonText}>Clear</ThemedText>
									</TouchableOpacity>
								) : null}
							</View>
							<ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
								{isLoadingCollections || isLoadingCategories ? (
									<View style={styles.loadingContainer}>
										<ActivityIndicator size="small" />
									</View>
								) : (
									<>
										<View style={styles.section}>
											<ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
												Collections
											</ThemedText>
											{collections && collections.length > 0 ? (
												collections.map((collection) => {
													const isSelected = selectedCollectionIds.includes(collection.id)
													return (
														<TouchableOpacity
															key={collection.id}
															style={[
																styles.option,
																isSelected
																	? {
																			backgroundColor:
																				theme === 'light' ? '#f0f8fa' : '#2a2a2a',
																		}
																	: undefined,
															]}
															onPress={() => handleToggleCollection(collection.id)}
															accessibilityRole="checkbox"
															accessibilityState={{ checked: isSelected }}
															accessibilityLabel={collection.title}
														>
															<ThemedText
																type={isSelected ? 'defaultSemiBold' : 'default'}
																style={[styles.optionText, isSelected ? styles.optionTextSelected : undefined]}
																numberOfLines={1}
															>
																{collection.title}
															</ThemedText>
															<View style={styles.checkboxContainer}>
																{isSelected ? (
																	<IconSymbol
																		name="checkmark"
																		size={20}
																		weight="medium"
																		color="#0a7ea4"
																	/>
																) : (
																	<View
																		style={[
																			styles.checkboxEmpty,
																			{
																				borderColor:
																					theme === 'light' ? '#ddd' : '#555',
																			},
																		]}
																	/>
																)}
															</View>
														</TouchableOpacity>
													)
												})
											) : null}
										</View>

										<View style={styles.section}>
											<ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
												Categories
											</ThemedText>
											{categories && categories.length > 0 ? (
												categories.map((category) => {
													const isSelected = selectedCategoryIds.includes(category.id)
													return (
														<TouchableOpacity
															key={category.id}
															style={[
																styles.option,
																isSelected
																	? {
																			backgroundColor:
																				theme === 'light' ? '#f0f8fa' : '#2a2a2a',
																		}
																	: undefined,
															]}
															onPress={() => handleToggleCategory(category.id)}
															accessibilityRole="checkbox"
															accessibilityState={{ checked: isSelected }}
															accessibilityLabel={category.title}
														>
															<ThemedText
																type={isSelected ? 'defaultSemiBold' : 'default'}
																style={[styles.optionText, isSelected ? styles.optionTextSelected : undefined]}
																numberOfLines={1}
															>
																{category.title}
															</ThemedText>
															<View style={styles.checkboxContainer}>
																{isSelected ? (
																	<IconSymbol
																		name="checkmark"
																		size={20}
																		weight="medium"
																		color="#0a7ea4"
																	/>
																) : (
																	<View
																		style={[
																			styles.checkboxEmpty,
																			{
																				borderColor:
																					theme === 'light' ? '#ddd' : '#555',
																			},
																		]}
																	/>
																)}
															</View>
														</TouchableOpacity>
													)
												})
											) : null}
										</View>
									</>
								)}
							</ScrollView>
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
		minHeight: 44,
	},
	triggerContent: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 8,
		gap: 8,
	},
	placeholderText: {
		fontSize: 14,
		opacity: 0.6,
	},
	selectedText: {
		fontSize: 14,
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
		left: -24,
		right: -24,
		zIndex: 1001,
	},
	dropdown: {
		borderRadius: 8,
		borderWidth: 1,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 8,
		maxHeight: 400,
		overflow: 'hidden',
	},
	dropdownHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
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
		maxHeight: 350,
	},
	section: {
		paddingVertical: 8,
	},
	sectionTitle: {
		fontSize: 14,
		paddingHorizontal: 16,
		paddingVertical: 8,
		opacity: 0.7,
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
		// Dynamic backgroundColor based on theme
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
		// Dynamic borderColor based on theme
	},
	loadingContainer: {
		paddingVertical: 24,
		alignItems: 'center',
	},
})

