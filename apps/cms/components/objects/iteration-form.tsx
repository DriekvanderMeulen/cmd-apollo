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
  objectPublicId: string;
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
  objectPublicId,
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

	const controlClassName =
		'h-10 w-full rounded-lg border border-[rgba(var(--border),0.9)] bg-[rgb(var(--surface))] px-3 text-sm text-[rgb(var(--color-neutral-900))] shadow-sm outline-none transition duration-150 ease-out placeholder:text-[rgb(var(--color-neutral-500))] focus:border-[rgba(var(--ring),0.7)] focus:ring-2 focus:ring-[rgba(var(--ring),0.22)]';

	const labelClassName =
		'mb-1.5 block text-sm font-medium text-[rgb(var(--color-neutral-700))]';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClassName}>
          Title <span className="text-[rgb(var(--color-accent))]">*</span>
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={controlClassName}
          placeholder="Enter iteration title..."
          required
        />
      </div>

      <div>
        <label className={labelClassName}>
          Date
        </label>
        <DatePicker
          selected={date}
          onChange={(date) => setDate(date || new Date())}
          dateFormat="yyyy-MM-dd"
          className={controlClassName}
          showPopperArrow={false}
        />
      </div>

      <div>
        <label className={labelClassName}>
          Description
        </label>
        <TiptapEditor
          value={description}
          onChange={(value) => setDescription(value)}
          placeholder="Enter iteration description..."
          uploadUrl={
            initialData?.id
              ? `/api/v1/objects/public/${objectPublicId}/iterations/${initialData.id}/images`
              : null
          }
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-3">
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
