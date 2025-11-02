"use client";

import { Extension } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { useCallback, useEffect, useState } from "react";
import { Editor } from "@tiptap/core";

export interface SlashCommandItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  command: (props: { editor: Editor; range: any }) => void;
  keywords?: string[];
}

export const slashCommands: SlashCommandItem[] = [
  {
    id: "heading1",
    title: "Heading 1",
    description: "Big section heading",
    icon: "H1",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHeading({ level: 1 })
        .run();
    },
    keywords: ["h1", "heading", "title"],
  },
  {
    id: "heading2",
    title: "Heading 2",
    description: "Medium section heading",
    icon: "H2",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHeading({ level: 2 })
        .run();
    },
    keywords: ["h2", "heading", "subtitle"],
  },
  {
    id: "heading3",
    title: "Heading 3",
    description: "Small section heading",
    icon: "H3",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHeading({ level: 3 })
        .run();
    },
    keywords: ["h3", "heading"],
  },
  {
    id: "paragraph",
    title: "Paragraph",
    description: "Just start writing with plain text",
    icon: "P",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setParagraph()
        .run();
    },
    keywords: ["p", "paragraph", "text"],
  },
  {
    id: "bulletList",
    title: "Bullet List",
    description: "Create a simple bullet list",
    icon: "•",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleBulletList()
        .run();
    },
    keywords: ["ul", "bullet", "list"],
  },
  {
    id: "orderedList",
    title: "Numbered List",
    description: "Create a list with numbering",
    icon: "1.",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleOrderedList()
        .run();
    },
    keywords: ["ol", "numbered", "list"],
  },
  {
    id: "codeBlock",
    title: "Code Block",
    description: "Capture a code snippet",
    icon: "</>",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCodeBlock()
        .run();
    },
    keywords: ["code", "snippet", "block"],
  },
  {
    id: "blockquote",
    title: "Quote",
    description: "Capture a quote",
    icon: "&quot;",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setBlockquote()
        .run();
    },
    keywords: ["quote", "blockquote"],
  },
  {
    id: "horizontalRule",
    title: "Divider",
    description: "Visually divide blocks",
    icon: "—",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHorizontalRule()
        .run();
    },
    keywords: ["divider", "hr", "line"],
  },
];

export const SlashCommandExtension = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },
});

export function useSlashCommand(editor: Editor | null) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [range, setRange] = useState<any>(null);

  const filteredCommands = slashCommands.filter((command) =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.description.toLowerCase().includes(query.toLowerCase()) ||
    command.keywords?.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
  );

  const openMenu = useCallback((range: any, query: string) => {
    setIsOpen(true);
    setQuery(query);
    setSelectedIndex(0);
    setRange(range);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(0);
    setRange(null);
  }, []);

  const selectCommand = useCallback((command: SlashCommandItem) => {
    if (editor && range) {
      command.command({ editor, range });
      closeMenu();
    }
  }, [editor, range, closeMenu]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelectedIndex((prev) => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
      case "Enter":
        event.preventDefault();
        if (filteredCommands[selectedIndex]) {
          selectCommand(filteredCommands[selectedIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        closeMenu();
        break;
    }
  }, [isOpen, filteredCommands, selectedIndex, selectCommand, closeMenu]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return {
    isOpen,
    query,
    selectedIndex,
    filteredCommands,
    openMenu,
    closeMenu,
    selectCommand,
  };
}
