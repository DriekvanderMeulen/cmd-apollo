import React from 'react'
import { Text, View, StyleSheet, Image } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'

type RichTextRendererProps = {
	content: unknown
	style?: unknown
}

type TipTapMark = {
	type: string
	attrs?: Record<string, unknown>
}

type TipTapNode = {
	type: string
	content?: Array<TipTapNode>
	text?: string
	marks?: Array<TipTapMark>
	attrs?: Record<string, unknown>
}

function extractPlainText(richText: unknown): string | null {
	if (!richText) return null
	if (typeof richText === 'string') return richText
	if (typeof richText !== 'object') return null

	function extractTextFromNode(node: TipTapNode): string {
		if (node.text) {
			return node.text
		}
		if (node.content && Array.isArray(node.content)) {
			return node.content.map(extractTextFromNode).join(' ')
		}
		return ''
	}

	const node = richText as TipTapNode
	return extractTextFromNode(node).trim() || null
}

function renderInlineNode(node: TipTapNode, baseStyle: any): Array<React.ReactNode> {
	if (node.type === 'text' && node.text) {
		let textStyle = { ...baseStyle }
		
		if (node.marks && Array.isArray(node.marks)) {
			node.marks.forEach((mark) => {
				if (mark.type === 'bold') {
					textStyle = { ...textStyle, fontWeight: 'bold' }
				} else if (mark.type === 'italic') {
					textStyle = { ...textStyle, fontStyle: 'italic' }
				} else if (mark.type === 'underline') {
					textStyle = { ...textStyle, textDecorationLine: 'underline' }
				}
			})
		}

		return [
			<Text key={Math.random()} style={textStyle}>
				{node.text}
			</Text>,
		]
	}

	if (node.content && Array.isArray(node.content)) {
		return node.content.flatMap((child) => renderInlineNode(child, baseStyle))
	}

	return []
}

function renderBlockNode(node: TipTapNode, baseStyle: any, index: number): React.ReactNode {
	const key = `block-${index}`

	if (node.type === 'paragraph') {
		const content = node.content
			? node.content.flatMap((child) => renderInlineNode(child, baseStyle))
			: []

		return (
			<View key={key} style={styles.block}>
				<Text style={baseStyle}>{content}</Text>
			</View>
		)
	}

	if (node.type === 'heading') {
		const level = node.attrs?.level as number | undefined
		const headingStyle = {
			...baseStyle,
			fontSize: level === 1 ? 28 : level === 2 ? 24 : level === 3 ? 20 : 16,
			fontWeight: 'bold' as const,
			marginTop: 16,
			marginBottom: 8,
		}

		const content = node.content
			? node.content.flatMap((child) => renderInlineNode(child, headingStyle))
			: []

		return (
			<View key={key} style={styles.block}>
				<Text style={headingStyle}>{content}</Text>
			</View>
		)
	}

	if (node.type === 'image') {
		const uri = typeof node.attrs?.src === 'string' ? node.attrs.src : null
		if (!uri) return null

		const alt = (node.attrs?.alt as string) || 'Image'
		const title = (node.attrs?.title as string) || null

		return (
			<View key={key} style={styles.block}>
				<Image
					source={{ uri }}
					style={styles.image}
					resizeMode="cover"
					accessible
					accessibilityLabel={alt}
				/>
				{title ? (
					<Text style={styles.caption}>{title}</Text>
				) : null}
			</View>
		)
	}

	if (node.type === 'bulletList' || node.type === 'orderedList') {
		const isOrdered = node.type === 'orderedList'
		const listItems = node.content || []

		return (
			<View key={key} style={styles.block}>
				{listItems.map((item, itemIndex) => {
					const itemContent = item.content || []
					return (
						<View key={`list-item-${index}-${itemIndex}`} style={styles.listItem}>
							<Text style={baseStyle}>
								{isOrdered ? `${itemIndex + 1}. ` : '• '}
								{itemContent.flatMap((child) => {
									if (child.type === 'paragraph' && child.content) {
										return child.content.flatMap((pChild) =>
											renderInlineNode(pChild, baseStyle),
										)
									}
									return renderInlineNode(child, baseStyle)
								})}
							</Text>
						</View>
					)
				})}
			</View>
		)
	}

	// Fallback for other node types
	if (node.content && Array.isArray(node.content)) {
		return (
			<View key={key} style={styles.block}>
				{node.content.map((child, childIndex) =>
					renderBlockNode(child, baseStyle, childIndex),
				)}
			</View>
		)
	}

	return null
}

export function RichTextRenderer({
	content,
	style,
}: RichTextRendererProps): React.JSX.Element | null {
	if (!content) return null

	// Handle plain string (backward compatibility)
	if (typeof content === 'string') {
		return <ThemedText style={style}>{content}</ThemedText>
	}

	// Handle JSON object
	if (typeof content === 'object') {
		const node = content as TipTapNode

		// Get base style from ThemedText
		const color = useThemeColor({}, 'text')
		const baseStyle = {
			color,
			fontSize: 16,
			lineHeight: 24,
			...(style as object),
		}

		// If it's a doc node, render its content
		if (node.type === 'doc' && node.content) {
			const blocks = node.content.map((child, index) =>
				renderBlockNode(child, baseStyle, index),
			)
			return (
				<View>
					{blocks.filter((block) => block !== null)}
				</View>
			)
		}

		// Fallback: extract plain text if structure is unexpected
		const text = extractPlainText(content)
		if (text) {
			return <ThemedText style={style}>{text}</ThemedText>
		}
	}

	return null
}

const styles = StyleSheet.create({
	block: {
		marginBottom: 12,
	},
	listItem: {
		marginBottom: 8,
		paddingLeft: 8,
	},
	image: {
		width: '100%',
		height: 220,
		borderRadius: 8,
		backgroundColor: '#f1f1f1',
	},
	caption: {
		marginTop: 8,
		fontSize: 14,
		opacity: 0.7,
	},
})
