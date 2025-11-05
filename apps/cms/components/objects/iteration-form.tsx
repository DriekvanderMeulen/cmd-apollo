"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { Button } from "@/components/ui";
import { TiptapEditor } from "./tiptap-editor";

interface IterationFormProps {
  initialData?: {
    id?: number;
    title: string;
    date: Date;
    description: string | object | null;
  };
  onSave: (data: {
    title: string;
    date: Date;
    description: string | object | null;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}


export function IterationForm({
  initialData,
  onSave,
  onCancel,
  isLoading = false,
}: IterationFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [date, setDate] = useState<Date>(initialData?.date || new Date());
  const [description, setDescription] = useState<string | object | null>(
    initialData?.description || null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDate(initialData.date);
      // Handle description - could be string or JSON object
      if (initialData.description === null || initialData.description === '') {
        setDescription(null);
      } else if (typeof initialData.description === 'string') {
        // Try to parse as JSON, if it fails, it's plain text
        try {
          const parsed = JSON.parse(initialData.description);
          setDescription(parsed);
        } catch {
          // Plain text, keep as string (will be converted by editor)
          setDescription(initialData.description);
        }
      } else {
        setDescription(initialData.description);
      }
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
      // Convert description to appropriate format
      let descriptionValue: string | object | null = null;
      if (description !== null) {
        if (typeof description === 'string') {
          descriptionValue = description.trim() || null;
        } else {
          descriptionValue = description;
        }
      }
      await onSave({
        title: titleTrim,
        date,
        description: descriptionValue,
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
        <TiptapEditor
          value={description}
          onChange={(value) => setDescription(value)}
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
