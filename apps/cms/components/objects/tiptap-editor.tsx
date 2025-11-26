'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

import { Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3, List, ListOrdered } from "lucide-react"
import { Button } from "@/components/ui"

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
        immediatelyRender: false,
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
				<div className="border-b border-neutral-200 p-2 flex gap-1 flex-wrap bg-neutral-50/50">
					<Button
						type="button"
						onClick={() => editor.chain().focus().toggleBold().run()}
                        variant={editor.isActive('bold') ? "secondary-gray" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
					>
						<Bold size={16} />
					</Button>
					<Button
						type="button"
						onClick={() => editor.chain().focus().toggleItalic().run()}
                        variant={editor.isActive('italic') ? "secondary-gray" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
					>
						<Italic size={16} />
					</Button>
					<Button
						type="button"
						onClick={() => editor.chain().focus().toggleUnderline().run()}
                        variant={editor.isActive('underline') ? "secondary-gray" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
					>
						<UnderlineIcon size={16} />
					</Button>
					<div className="w-px bg-neutral-200 mx-1" />
					<Button
						type="button"
						onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        variant={editor.isActive('heading', { level: 1 }) ? "secondary-gray" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
					>
						<Heading1 size={16} />
					</Button>
					<Button
						type="button"
						onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        variant={editor.isActive('heading', { level: 2 }) ? "secondary-gray" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
					>
						<Heading2 size={16} />
					</Button>
					<Button
						type="button"
						onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        variant={editor.isActive('heading', { level: 3 }) ? "secondary-gray" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
					>
						<Heading3 size={16} />
					</Button>
					<div className="w-px bg-neutral-200 mx-1" />
					<Button
						type="button"
						onClick={() => editor.chain().focus().toggleBulletList().run()}
                        variant={editor.isActive('bulletList') ? "secondary-gray" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
					>
						<List size={16} />
					</Button>
					<Button
						type="button"
						onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        variant={editor.isActive('orderedList') ? "secondary-gray" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
					>
						<ListOrdered size={16} />
					</Button>
				</div>
				<EditorContent editor={editor} />
			</div>
		</div>
	)
}

