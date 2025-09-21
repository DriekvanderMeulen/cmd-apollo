import { useMemo, useState } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'

type DropdownOption<T extends string | number> = { value: T; label: string }

type DropdownProps<T extends string | number> = {
	label: string
	options: Array<DropdownOption<T>>
	value: T | null
	onChange: (val: T | null) => void
	disabled?: boolean
}

export default function Dropdown<T extends string | number>({ label, options, value, onChange, disabled = false }: DropdownProps<T>) {
	const [open, setOpen] = useState(false)
	const selected = useMemo(() => options.find((o) => o.value === value)?.label ?? 'All', [options, value])

	return (
		<View>
			<Text className="text-xs text-zinc-500 mb-1">{label}</Text>
			<Pressable
				className={`px-3 py-2 rounded border ${disabled ? 'bg-zinc-100/60 dark:bg-zinc-800/60 border-zinc-200/60 dark:border-zinc-700/60' : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'}`}
				onPress={() => {
					if (!disabled) setOpen(true)
				}}
				disabled={disabled}
			>
				<Text className={`text-sm ${disabled ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`} numberOfLines={1}>{selected}</Text>
			</Pressable>

			<Modal visible={open && !disabled} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
				<Pressable className="flex-1 bg-black/40" onPress={() => setOpen(false)}>
					<View className="absolute left-3 right-3 top-24 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
						<ScrollView style={{ maxHeight: 360 }}>
							<Pressable
								className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800"
								onPress={() => {
									onChange(null)
									setOpen(false)
								}}
							>
								<Text className="text-sm text-zinc-900 dark:text-zinc-100">All</Text>
							</Pressable>
							{options.map((opt) => (
								<Pressable
									key={String(opt.value)}
									className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800"
									onPress={() => {
										onChange(opt.value)
										setOpen(false)
									}}
								>
									<Text className="text-sm text-zinc-900 dark:text-zinc-100">{opt.label}</Text>
								</Pressable>
							))}
						</ScrollView>
					</View>
				</Pressable>
			</Modal>
		</View>
	)
}


