import React, { useState, useRef, useEffect } from 'react'
import { StyleSheet, Pressable, TouchableOpacity, View, ScrollView, Dimensions } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Colors } from '@/constants/theme'
import { useTheme } from '@/src/providers/ThemeProvider'

type DropdownOption<T> = {
	value: T
	label: string
}

type TrueDropdownProps<T> = {
	value: T
	options: Array<DropdownOption<T>>
	onChange: (value: T) => void
	placeholder?: string
	triggerStyle?: object
	isOpen?: boolean
	onOpenChange?: (open: boolean) => void
	icon?: string
}

export function TrueDropdown<T>({
	value,
	options,
	onChange,
	placeholder,
	triggerStyle,
	isOpen: controlledIsOpen,
	onOpenChange,
	icon,
}: TrueDropdownProps<T>): React.JSX.Element {
	const [internalIsOpen, setInternalIsOpen] = useState(false)
	const [triggerHeight, setTriggerHeight] = useState(0)
	const triggerRef = useRef<View>(null)
	const { resolvedTheme: theme, isOLED } = useTheme()

	const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen

	function handlePress(): void {
		const newValue = !isOpen
		if (onOpenChange) {
			onOpenChange(newValue)
		} else {
			setInternalIsOpen(newValue)
		}
	}

	function handleSelect(optionValue: T): void {
		onChange(optionValue)
		if (onOpenChange) {
			onOpenChange(false)
		} else {
			setInternalIsOpen(false)
		}
	}

	function handleClose(): void {
		if (onOpenChange) {
			onOpenChange(false)
		} else {
			setInternalIsOpen(false)
		}
	}

	const selectedOption = options.find((option) => option.value === value)
	const screenWidth = Dimensions.get('window').width
	const [triggerX, setTriggerX] = useState(0)

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
					triggerStyle,
				]}
				onPress={handlePress}
				accessibilityRole="button"
				accessibilityLabel={selectedOption ? selectedOption.label : placeholder ?? 'Select...'}
				accessibilityState={{ expanded: isOpen }}
			>
				<View style={styles.triggerContent}>
					{icon ? (
						<IconSymbol
							name={icon}
							size={16}
							weight="medium"
							color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
						/>
					) : null}
					<ThemedText style={styles.triggerText} numberOfLines={1}>
						{selectedOption ? selectedOption.label : placeholder ?? 'Select...'}
					</ThemedText>
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
						onPress={handleClose}
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
							<ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
								{options.map((option) => {
									const isSelected = value === option.value
									return (
										<TouchableOpacity
											key={String(option.value)}
											style={[
												styles.option,
												isSelected
													? {
															backgroundColor:
																theme === 'light' ? '#f0f8fa' : '#2a2a2a',
														}
													: undefined,
											]}
											onPress={() => handleSelect(option.value)}
											accessibilityRole="button"
											accessibilityState={{ selected: isSelected }}
											accessibilityLabel={option.label}
										>
											<ThemedText
												type={isSelected ? 'defaultSemiBold' : 'default'}
												style={[styles.optionText, isSelected ? styles.optionTextSelected : undefined]}
												numberOfLines={1}
											>
												{option.label}
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
													<View
														style={[
															styles.checkboxEmpty,
															{
																borderColor: theme === 'light' ? '#ddd' : '#555',
															},
														]}
													/>
												)}
											</View>
										</TouchableOpacity>
									)
								})}
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
		minWidth: 120,
		minHeight: 44,
	},
	triggerContent: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 8,
		gap: 8,
	},
	triggerText: {
		fontSize: 14,
		flex: 1,
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
		maxHeight: 300,
		overflow: 'hidden',
	},
	optionsList: {
		maxHeight: 300,
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
})

