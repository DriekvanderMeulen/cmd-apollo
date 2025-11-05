import React from 'react'
import { StyleSheet } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

type TipTapNode = {
	type: string
	content?: Array<TipTapNode>
	text?: string
	attrs?: Record<string, unknown>
}

type RichTextRendererProps = {
	content: unknown
	style?: unknown
}

function renderNode(node: TipTapNode, index: number): React.ReactNode {
	if (node.text) {
		return <ThemedText key={index}>{node.text}</ThemedText>
	}

	if (node.content && Array.isArray(node.content)) {
		const children = node.content.map((child, idx) => renderNode(child, idx))

		switch (node.type) {
			case 'paragraph':
				return (
					<ThemedText key={index} style={styles.paragraph}>
						{children}
					</ThemedText>
				)
			case 'heading':
				const level = (node.attrs?.level as number) ?? 1
				return (
					<ThemedText
						key={index}
						type={level === 1 ? 'title' : 'subtitle'}
						style={styles.heading}
					>
						{children}
					</ThemedText>
				)
			case 'bulletList':
			case 'orderedList':
				return <React.Fragment key={index}>{children}</React.Fragment>
			case 'listItem':
				return (
					<ThemedText key={index} style={styles.listItem}>
						• {children}
					</ThemedText>
				)
			case 'bold':
			case 'strong':
				return (
					<ThemedText key={index} type="defaultSemiBold">
						{children}
					</ThemedText>
				)
			case 'italic':
			case 'em':
				return (
					<ThemedText key={index} style={styles.italic}>
						{children}
					</ThemedText>
				)
			case 'hardBreak':
				return <ThemedText key={index}>{'\n'}</ThemedText>
			case 'doc':
				return <React.Fragment key={index}>{children}</React.Fragment>
			default:
				return <React.Fragment key={index}>{children}</React.Fragment>
		}
	}

	return null
}

export function RichTextRenderer({ content, style }: RichTextRendererProps): React.JSX.Element | null {
	if (!content) return null
	if (typeof content === 'string') {
		return <ThemedText style={style}>{content}</ThemedText>
	}
	if (typeof content !== 'object') return null

	const node = content as TipTapNode
	const rendered = renderNode(node, 0)

	if (!rendered) return null

	// If it's already a fragment or has a wrapper, return as is
	if (React.isValidElement(rendered) && rendered.type === React.Fragment) {
		return <ThemedView style={style}>{rendered}</ThemedView>
	}

	return <ThemedView style={style}>{rendered}</ThemedView>
}

const styles = StyleSheet.create({
	paragraph: {
		marginBottom: 12,
	},
	heading: {
		marginTop: 16,
		marginBottom: 8,
	},
	listItem: {
		marginBottom: 4,
		marginLeft: 16,
	},
	italic: {
		fontStyle: 'italic',
	},
})

