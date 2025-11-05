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

export function extractPlainText(richText: unknown): string | null {
	if (!richText) return null
	if (typeof richText === 'string') return richText
	if (typeof richText !== 'object') return null

	const node = richText as TipTapNode
	return extractTextFromNode(node).trim() || null
}

