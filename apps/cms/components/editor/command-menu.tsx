"use client";

import { useEffect, useRef } from "react";
import { SlashCommandItem } from "./slash-command";

interface CommandMenuProps {
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  commands: SlashCommandItem[];
  onSelect: (command: SlashCommandItem) => void;
  onClose: () => void;
}

export function CommandMenu({
  isOpen,
  query,
  selectedIndex,
  commands,
  onSelect,
  onClose,
}: CommandMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedItemRef.current && isOpen) {
      selectedItemRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex, isOpen]);

  if (!isOpen || commands.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-80 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
      style={{
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="p-2">
        <div className="text-xs text-neutral-500 mb-2 px-2">
          {query ? `Results for "${query}"` : "Choose a command"}
        </div>
        <div className="space-y-1">
          {commands.map((command, index) => (
            <button
              key={command.id}
              ref={index === selectedIndex ? selectedItemRef : null}
              onClick={() => onSelect(command)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                index === selectedIndex
                  ? "bg-blue-50 text-blue-900 border border-blue-200"
                  : "hover:bg-neutral-50 text-neutral-700"
              }`}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-neutral-100 flex items-center justify-center text-sm font-medium">
                {command.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{command.title}</div>
                <div className="text-xs text-neutral-500 truncate">
                  {command.description}
                </div>
              </div>
              {index === selectedIndex && (
                <div className="flex-shrink-0 text-blue-600">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M6.5 3.5L11 8l-4.5 4.5L5 11l3-3-3-3z" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-neutral-100">
          <div className="text-xs text-neutral-400 px-2">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-xs bg-neutral-100 rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="inline-flex items-center gap-1 ml-3">
              <kbd className="px-1.5 py-0.5 text-xs bg-neutral-100 rounded">Enter</kbd>
              Select
            </span>
            <span className="inline-flex items-center gap-1 ml-3">
              <kbd className="px-1.5 py-0.5 text-xs bg-neutral-100 rounded">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SlashCommandMenuProps {
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  commands: SlashCommandItem[];
  onSelect: (command: SlashCommandItem) => void;
  onClose: () => void;
  position?: { top: number; left: number };
}

export function SlashCommandMenu({
  isOpen,
  query,
  selectedIndex,
  commands,
  onSelect,
  onClose,
  position,
}: SlashCommandMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedItemRef.current && isOpen) {
      selectedItemRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen || commands.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="absolute z-50 w-80 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
      style={{
        top: position?.top || 0,
        left: position?.left || 0,
      }}
    >
      <div className="p-2">
        <div className="text-xs text-neutral-500 mb-2 px-2">
          {query ? `Results for "${query}"` : "Choose a command"}
        </div>
        <div className="space-y-1">
          {commands.map((command, index) => (
            <button
              key={command.id}
              ref={index === selectedIndex ? selectedItemRef : null}
              onClick={() => onSelect(command)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                index === selectedIndex
                  ? "bg-blue-50 text-blue-900 border border-blue-200"
                  : "hover:bg-neutral-50 text-neutral-700"
              }`}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-neutral-100 flex items-center justify-center text-sm font-medium">
                {command.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{command.title}</div>
                <div className="text-xs text-neutral-500 truncate">
                  {command.description}
                </div>
              </div>
              {index === selectedIndex && (
                <div className="flex-shrink-0 text-blue-600">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M6.5 3.5L11 8l-4.5 4.5L5 11l3-3-3-3z" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-neutral-100">
          <div className="text-xs text-neutral-400 px-2">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-xs bg-neutral-100 rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="inline-flex items-center gap-1 ml-3">
              <kbd className="px-1.5 py-0.5 text-xs bg-neutral-100 rounded">Enter</kbd>
              Select
            </span>
            <span className="inline-flex items-center gap-1 ml-3">
              <kbd className="px-1.5 py-0.5 text-xs bg-neutral-100 rounded">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
