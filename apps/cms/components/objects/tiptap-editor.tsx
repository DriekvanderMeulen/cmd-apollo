'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

type TiptapEditorProps = {
	value: string | object | null
	onChange: (value: object | null) => void
	placeholder?: string
	className?: string
}

function convertStringToTiptapJson(text: string): object {
	return {
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: text ? [{ type: 'text', text }] : [],
			},
		],
	}
}

export function TiptapEditor({
	value,
	onChange,
	placeholder = 'Enter description...',
	className,
}: TiptapEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
			Placeholder.configure({
				placeholder,
			}),
		],
		content: null,
		editorProps: {
			attributes: {
				class:
					'min-h-[200px] w-full rounded-md px-3 py-2 border border-neutral-200 text-sm focus:border-neutral-300 focus:ring-1 focus:ring-accent/20 outline-none transition-colors prose prose-sm max-w-none',
			},
		},
		onUpdate: ({ editor }) => {
			const json = editor.getJSON()
			onChange(json)
		},
	})

	useEffect(() => {
		if (!editor) return

		let content: object | null = null

		if (value === null || value === '') {
			content = null
		} else if (typeof value === 'string') {
			// Convert plain string to Tiptap JSON
			content = convertStringToTiptapJson(value)
		} else if (typeof value === 'object') {
			// Use JSON object directly
			content = value
		}

		const currentJson = editor.getJSON()
		const currentContent = JSON.stringify(currentJson)
		const newContent = JSON.stringify(content)

		// Only update if content actually changed to avoid infinite loops
		if (currentContent !== newContent) {
			editor.commands.setContent(content || '', { emitUpdate: false })
		}
	}, [editor, value])

	if (!editor) {
		return (
			<div className="min-h-[200px] w-full rounded-md px-3 py-2 border border-neutral-200 text-sm bg-neutral-50 flex items-center justify-center">
				<span className="text-neutral-400">Loading editor...</span>
			</div>
		)
	}

	return (
		<div className={className}>
			<div className="border border-neutral-200 rounded-md focus-within:border-neutral-300 focus-within:ring-1 focus-within:ring-accent/20 transition-colors">
				<div className="border-b border-neutral-200 p-2 flex gap-2 flex-wrap">
					<button
						type="button"
						onClick={() => editor.chain().focus().toggleBold().run()}
						className={`px-2 py-1 rounded text-sm font-semibold transition-colors ${
							editor.isActive('bold')
								? 'bg-neutral-200 text-neutral-900'
								: 'text-neutral-600 hover:bg-neutral-100'
						}`}
					>
						B
					</button>
					<button
						type="button"
						onClick={() => editor.chain().focus().toggleItalic().run()}
						className={`px-2 py-1 rounded text-sm italic transition-colors ${
							editor.isActive('italic')
								? 'bg-neutral-200 text-neutral-900'
								: 'text-neutral-600 hover:bg-neutral-100'
						}`}
					>
						I
					</button>
					<button
						type="button"
						onClick={() => editor.chain().focus().toggleUnderline().run()}
						className={`px-2 py-1 rounded text-sm underline transition-colors ${
							editor.isActive('underline')
								? 'bg-neutral-200 text-neutral-900'
								: 'text-neutral-600 hover:bg-neutral-100'
						}`}
					>
						U
					</button>
					<div className="w-px bg-neutral-200" />
					<button
						type="button"
						onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
						className={`px-2 py-1 rounded text-sm transition-colors ${
							editor.isActive('heading', { level: 1 })
								? 'bg-neutral-200 text-neutral-900'
								: 'text-neutral-600 hover:bg-neutral-100'
						}`}
					>
						H1
					</button>
					<button
						type="button"
						onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
						className={`px-2 py-1 rounded text-sm transition-colors ${
							editor.isActive('heading', { level: 2 })
								? 'bg-neutral-200 text-neutral-900'
								: 'text-neutral-600 hover:bg-neutral-100'
						}`}
					>
						H2
					</button>
					<button
						type="button"
						onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
						className={`px-2 py-1 rounded text-sm transition-colors ${
							editor.isActive('heading', { level: 3 })
								? 'bg-neutral-200 text-neutral-900'
								: 'text-neutral-600 hover:bg-neutral-100'
						}`}
					>
						H3
					</button>
					<div className="w-px bg-neutral-200" />
					<button
						type="button"
						onClick={() => editor.chain().focus().toggleBulletList().run()}
						className={`px-2 py-1 rounded text-sm transition-colors ${
							editor.isActive('bulletList')
								? 'bg-neutral-200 text-neutral-900'
								: 'text-neutral-600 hover:bg-neutral-100'
						}`}
					>
						•
					</button>
					<button
						type="button"
						onClick={() => editor.chain().focus().toggleOrderedList().run()}
						className={`px-2 py-1 rounded text-sm transition-colors ${
							editor.isActive('orderedList')
								? 'bg-neutral-200 text-neutral-900'
								: 'text-neutral-600 hover:bg-neutral-100'
						}`}
					>
						1.
					</button>
				</div>
				<EditorContent editor={editor} />
			</div>
		</div>
	)
}

