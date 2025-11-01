"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useState, useRef } from "react";
import { offset } from "@floating-ui/dom";
import { useSlashCommand, slashCommands } from "./slash-command";
import { SlashCommandMenu } from "./command-menu";

interface RichTextEditorProps {
  content?: any;
  onChange?: (content: any) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Type '/' for commands...",
  className = "",
}: RichTextEditorProps) {
  const [isSlashMenuOpen, setIsSlashMenuOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashRange, setSlashRange] = useState<any>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        // Link and Underline are now included in StarterKit by default
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: "text-blue-600 underline hover:text-blue-800 cursor-pointer",
          },
        },
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
    ],
    content: content || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[120px] p-4",
      },
      handleKeyDown: (view, event) => {
        // Handle slash command
        if (event.key === "/") {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;
          
          // Check if we're at the start of a line or after whitespace
          const lineStart = $from.start($from.depth);
          const textBefore = state.doc.textBetween(lineStart, $from.pos);
          
          if (textBefore.trim() === "" || textBefore.endsWith(" ")) {
            setIsSlashMenuOpen(true);
            setSlashQuery("");
            setSlashRange({ from: $from.pos, to: $from.pos });
            return true;
          }
        }
        
        // Handle escape to close menus
        if (event.key === "Escape") {
          setIsSlashMenuOpen(false);
          setIsLinkMenuOpen(false);
          return true;
        }
        
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && content !== undefined) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  const handleSlashCommand = useCallback((command: any) => {
    if (editor && slashRange) {
      command.command({ editor, range: slashRange });
      setIsSlashMenuOpen(false);
      setSlashQuery("");
      setSlashRange(null);
    }
  }, [editor, slashRange]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href;
    setLinkUrl(previousUrl || "");
    setIsLinkMenuOpen(true);
    setTimeout(() => linkInputRef.current?.focus(), 0);
  }, [editor]);

  const handleLinkSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }
    setIsLinkMenuOpen(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
    icon,
  }: {
    onClick: () => void;
    isActive: boolean;
    children?: React.ReactNode;
    title?: string;
    icon?: string;
  }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-md transition-all duration-150 ${
        isActive 
          ? "bg-blue-100 text-blue-700 shadow-sm" 
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
      }`}
      type="button"
      title={title}
    >
      {icon ? (
        <span className="text-sm font-medium">{icon}</span>
      ) : (
        children
      )}
    </button>
  );

  const filteredCommands = slashCommands.filter((command) =>
    command.title.toLowerCase().includes(slashQuery.toLowerCase()) ||
    command.description.toLowerCase().includes(slashQuery.toLowerCase()) ||
    command.keywords?.some(keyword => keyword.toLowerCase().includes(slashQuery.toLowerCase()))
  );

  return (
    <div className={`border border-neutral-200 rounded-lg bg-white ${className}`}>
      {/* Modern Toolbar */}
      <div className="border-b border-neutral-200 p-3">
        <div className="flex items-center gap-1">
          {/* Text Formatting Group */}
          <div className="flex items-center gap-1 pr-2 border-r border-neutral-200">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title="Bold (Ctrl+B)"
              icon="B"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title="Italic (Ctrl+I)"
              icon="I"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              title="Underline (Ctrl+U)"
              icon="U"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
              title="Strikethrough"
              icon="S"
            />
          </div>

          {/* Headings Group */}
          <div className="flex items-center gap-1 px-2 border-r border-neutral-200">
            <ToolbarButton
              onClick={() => editor.chain().focus().setParagraph().run()}
              isActive={editor.isActive("paragraph")}
              title="Normal text"
              icon="P"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive("heading", { level: 1 })}
              title="Heading 1"
              icon="H1"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
              icon="H2"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive("heading", { level: 3 })}
              title="Heading 3"
              icon="H3"
            />
          </div>

          {/* Lists Group */}
          <div className="flex items-center gap-1 px-2 border-r border-neutral-200">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              title="Bullet list"
              icon="•"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              title="Numbered list"
              icon="1."
            />
          </div>

          {/* Actions Group */}
          <div className="flex items-center gap-1 pl-2">
            <ToolbarButton
              onClick={setLink}
              isActive={editor.isActive("link")}
              title="Add link"
              icon="🔗"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive("code")}
              title="Inline code"
              icon="</>"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
              title="Quote"
              icon="&quot;"
            />
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent
          editor={editor}
          className="min-h-[120px] focus-within:ring-2 focus-within:ring-blue-500/20 transition-all"
        />

        {/* Enhanced Bubble Menu */}
        <BubbleMenu
          editor={editor}
          options={{
            offset: 8,
            placement: "top",
          }}
          className="flex gap-1 p-2 bg-white border border-neutral-200 rounded-lg shadow-lg"
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold"
            icon="B"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic"
            icon="I"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Underline"
            icon="U"
          />
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive("link")}
            title="Add link"
            icon="🔗"
          />
        </BubbleMenu>

        {/* Slash Command Menu */}
        {isSlashMenuOpen && (
          <SlashCommandMenu
            isOpen={isSlashMenuOpen}
            query={slashQuery}
            selectedIndex={0}
            commands={filteredCommands}
            onSelect={handleSlashCommand}
            onClose={() => setIsSlashMenuOpen(false)}
          />
        )}

        {/* Link Input Menu */}
        {isLinkMenuOpen && (
          <div className="absolute top-0 left-0 z-50 p-3 bg-white border border-neutral-200 rounded-lg shadow-lg">
            <form onSubmit={handleLinkSubmit} className="flex gap-2">
              <input
                ref={linkInputRef}
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Enter URL..."
                className="px-3 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Set
              </button>
              <button
                type="button"
                onClick={() => setIsLinkMenuOpen(false)}
                className="px-3 py-2 bg-neutral-100 text-neutral-700 rounded-md text-sm hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
