import React from 'react'
import { ThemedText } from '@/components/themed-text'

type RichTextRendererProps = {
	content: unknown
	style?: unknown
}

function extractPlainText(richText: unknown): string | null {
	if (!richText) return null
	if (typeof richText === 'string') return richText
	if (typeof richText !== 'object') return null

	type TipTapNode = {
		type: string
		content?: Array<TipTapNode>
		text?: string
	}

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

export function RichTextRenderer({ content, style }: RichTextRendererProps): React.JSX.Element | null {
	if (!content) return null
	
	const text = typeof content === 'string' 
		? content 
		: extractPlainText(content)
	
	if (!text) return null

	return <ThemedText style={style}>{text}</ThemedText>
}

