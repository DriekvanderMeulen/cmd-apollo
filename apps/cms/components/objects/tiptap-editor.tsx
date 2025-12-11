'use client'

import { useEffect, useRef, useState } from 'react'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'

import { Bold, Heading1, Heading2, Heading3, Italic, List, ListOrdered, Underline as UnderlineIcon, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui"

type TiptapEditorProps = {
	value: string | object | null
	onChange: (value: object | null) => void
	placeholder?: string
	className?: string
	uploadUrl?: string | null
}

const ImageWithMeta = Image.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			r2Key: {
				default: null,
			},
		}
	},
})

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
	uploadUrl,
}: TiptapEditorProps) {
	const [isUploading, setIsUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement | null>(null)

	const editor = useEditor({
        immediatelyRender: false,
		extensions: [
			StarterKit,
			Underline,
			ImageWithMeta.configure({
				inline: false,
			}),
			Placeholder.configure({
				placeholder,
			}),
		],
		content: null,
		editorProps: {
			attributes: {
				class:
					'min-h-[220px] w-full rounded-lg px-3 py-3 border border-[rgba(var(--border),0.9)] bg-[rgb(var(--surface))] text-sm text-[rgb(var(--color-neutral-900))] shadow-sm outline-none transition duration-150 ease-out focus:border-[rgba(var(--ring),0.7)] focus:ring-2 focus:ring-[rgba(var(--ring),0.25)] prose prose-sm max-w-none',
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
			<div className="flex min-h-[220px] w-full items-center justify-center rounded-lg border border-[rgba(var(--border),0.9)] bg-[rgb(var(--surface-muted))] px-3 py-2 text-sm">
				<span className="text-[rgb(var(--color-neutral-500))]">Loading editor...</span>
			</div>
		)
	}

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		if (!uploadUrl) {
			e.target.value = ''
			return
		}
		const file = e.target.files?.[0]
		if (!file) return
		if (!editor) {
			e.target.value = ''
			return
		}

		setIsUploading(true)
		try {
			const formData = new FormData()
			formData.append('file', file)
			const res = await fetch(uploadUrl, {
				method: 'POST',
				body: formData,
			})
			if (!res.ok) {
				throw new Error('Upload failed')
			}
			const data = (await res.json()) as { key: string; url: string }
			editor
				.chain()
				.focus()
				.setImage(
					{
						src: data.url,
						r2Key: data.key,
						alt: file.name,
					} as any,
				)
				.run()
		} catch (error) {
			console.error('Image upload failed', error)
		} finally {
			setIsUploading(false)
			e.target.value = ''
		}
	}

	return (
		<div className={className}>
			<div className="rounded-xl border border-[rgba(var(--border),0.9)] bg-[rgb(var(--surface))] shadow-sm transition focus-within:border-[rgba(var(--ring),0.7)] focus-within:ring-2 focus-within:ring-[rgba(var(--ring),0.2)]">
				<div className="flex flex-wrap gap-1 border-b border-[rgba(var(--border),0.9)] bg-[rgb(var(--surface-muted))] p-2 backdrop-blur">
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
					<div className="mx-1 h-6 w-px bg-[rgba(var(--border),0.9)]" />
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
					<div className="mx-1 h-6 w-px bg-[rgba(var(--border),0.9)]" />
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
					<Button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						variant={editor.isActive('image') ? "secondary-gray" : "ghost"}
						size="icon"
						className="h-8 w-8"
						disabled={!uploadUrl || isUploading}
					>
						<ImageIcon size={16} />
					</Button>
					<input
						type="file"
						accept="image/*"
						ref={fileInputRef}
						className="hidden"
						onChange={handleFileChange}
					/>
				</div>
				<EditorContent editor={editor} />
			</div>
		</div>
	)
}

