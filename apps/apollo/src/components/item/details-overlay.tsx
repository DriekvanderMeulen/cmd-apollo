import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import type { Item, Iteration } from 'cms/types'
import type { ThemeMode } from '@repo/ui/theme'
import { theme } from '@repo/ui/theme'
import { GradientBackdrop } from './gradient-backdrop'
import { IterationArrowButton } from './iteration-arrow-button'

interface DetailsOverlayProps {
	visible: boolean
	mode: ThemeMode
	item: Item | null
	iteration: Iteration | null
	hasNext: boolean
	hasPrevious: boolean
	onNext(): void
	onPrevious(): void
	isEmpty: boolean
}

export function DetailsOverlay(props: DetailsOverlayProps): JSX.Element {
	const { visible, mode, item, iteration, hasNext, hasPrevious, onNext, onPrevious, isEmpty } = props
	const pointerEvents = visible ? 'auto' : 'none'
	return (
		<View pointerEvents={pointerEvents as 'auto' | 'none'} style={[styles.wrapper, { opacity: visible ? 1 : 0 }]}> 
			<GradientBackdrop mode={mode}>
				<View style={styles.content}>
					{renderDetails({ item, iteration, mode, isEmpty })}
					{!isEmpty ? (
						<View style={styles.arrows}>
							<IterationArrowButton direction='previous' mode={mode} disabled={!hasPrevious} onPress={onPrevious} />
							<IterationArrowButton direction='next' mode={mode} disabled={!hasNext} onPress={onNext} />
						</View>
					) : null}
				</View>
			</GradientBackdrop>
		</View>
	)
}

function renderDetails(params: { item: Item | null; iteration: Iteration | null; mode: ThemeMode; isEmpty: boolean }): JSX.Element {
	const { item, iteration, mode, isEmpty } = params
	if (!item) {
		return (
			<View style={styles.textBlock}>
				<Text style={[styles.title, { color: theme.color.text[mode] }]}>Loading item…</Text>
			</View>
		)
	}

	if (isEmpty) {
		return (
			<View style={styles.textBlock}>
				<Text style={[styles.title, { color: theme.color.text[mode] }]}>{item.title}</Text>
				<Text style={[styles.body, { color: theme.color.subtleText[mode] }]}>This item has no iterations yet. Check back soon.</Text>
			</View>
		)
	}

	if (!iteration) {
		return (
			<View style={styles.textBlock}>
				<Text style={[styles.title, { color: theme.color.text[mode] }]}>{item.title}</Text>
				<Text style={[styles.body, { color: theme.color.subtleText[mode] }]}>Select an iteration to continue.</Text>
			</View>
		)
	}

	return (
		<View style={styles.textBlock}>
			<Text style={[styles.iterationMeta, { color: theme.color.subtleText[mode] }]}>Iteration {iteration.order}</Text>
			<Text style={[styles.title, { color: theme.color.text[mode] }]}>{iteration.title || item.title}</Text>
			<Text style={[styles.body, { color: theme.color.subtleText[mode] }]}>{iteration.summary ?? item.summary}</Text>
			{!iteration.videoKey ? (
				<Text style={[styles.body, styles.videoHint, { color: theme.color.subtleText[mode] }]}>Video preview unavailable. Review the poster imagery instead.</Text>
			) : null}
		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'flex-end'
	},
	content: {
		paddingHorizontal: 24,
		paddingBottom: 36,
		gap: 24
	},
	textBlock: {
		gap: 8
	},
	iterationMeta: {
		fontSize: 14,
		fontWeight: '500',
		letterSpacing: 0.4,
		textTransform: 'uppercase'
	},
	title: {
		fontSize: 26,
		fontWeight: '600',
		lineHeight: 32
	},
	body: {
		fontSize: 17,
		lineHeight: 24
	},
	videoHint: {
		fontStyle: 'italic'
	},
	arrows: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	}
})

