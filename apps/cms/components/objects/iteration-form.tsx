"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { Button } from "@/components/ui";

interface IterationFormProps {
  initialData?: {
    id?: number;
    title: string;
    date: Date;
    description: string | null;
  };
  onSave: (data: {
    title: string;
    date: Date;
    description: string | null;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
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

export function IterationForm({
  initialData,
  onSave,
  onCancel,
  isLoading = false,
}: IterationFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [date, setDate] = useState<Date>(initialData?.date || new Date());
  const [description, setDescription] = useState<string>(
    initialData?.description || "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDate(initialData.date);
      // Convert existing rich text JSON to plain text if needed
      const desc = typeof initialData.description === 'string' 
        ? initialData.description 
        : extractPlainText(initialData.description) || "";
      setDescription(desc);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const titleTrim = title.trim();
    if (!titleTrim) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        title: titleTrim,
        date,
        description: description.trim() || null,
      });
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1.5 text-sm font-medium text-neutral-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-9 w-full rounded-md px-3 border border-neutral-200 text-sm focus:border-neutral-300 focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
          placeholder="Enter iteration title..."
          required
        />
      </div>

      <div>
        <label className="block mb-1.5 text-sm font-medium text-neutral-700">
          Date
        </label>
        <DatePicker
          selected={date}
          onChange={(date) => setDate(date || new Date())}
          dateFormat="yyyy-MM-dd"
          className="h-9 w-full rounded-md px-3 border border-neutral-200 text-sm focus:border-neutral-300 focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
          showPopperArrow={false}
        />
      </div>

      <div>
        <label className="block mb-1.5 text-sm font-medium text-neutral-700">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[200px] w-full rounded-md px-3 py-2 border border-neutral-200 text-sm focus:border-neutral-300 focus:ring-1 focus:ring-accent/20 outline-none transition-colors resize-y"
          placeholder="Enter iteration description..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting || isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isLoading || !title.trim()}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
