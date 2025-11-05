"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { Button, Spinner } from "@/components/ui";
import { VideoUpload } from "./video-upload";
import { TiptapEditor } from "./tiptap-editor";

async function apiJson(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
) {
  const res = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}

export function NewObjectForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<string | object | null>(null);
  const [collectionId, setCollectionId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [collections, setCollections] = useState<
    Array<{ id: number; title: string }>
  >([]);
  const [categories, setCategories] = useState<
    Array<{ id: number; title: string }>
  >([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [colsRes, catsRes] = await Promise.all([
          fetch("/api/v1/objects/eligible-collections", { cache: "no-store" }),
          fetch("/api/v1/objects/categories", { cache: "no-store" }),
        ]);
        if (!colsRes.ok || !catsRes.ok) throw new Error("load failed");
        const cols = await colsRes.json();
        const cats = await catsRes.json();
        if (cancelled) return;
        setCollections(cols.items || []);
        setCategories(cats.items || []);
      } catch (e) {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const [isPublic, setIsPublic] = useState(false);

  const handleVideoUpload = async (file: File) => {
    setVideoFile(file);
  };

  const submit = () => {
    const titleTrim = title.trim();
    const collectionNum = Number(collectionId);
    if (!titleTrim) return toast.error("Title is required");
    if (!Number.isFinite(collectionNum))
      return toast.error("Collection ID is required");
    startTransition(() => {
      (async () => {
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
          const create = await apiJson("/api/v1/objects", "POST", {
            title: titleTrim,
            description: descriptionValue,
            collectionId: collectionNum,
            categoryId: categoryId ? Number(categoryId) : null,
            public: isPublic,
          });
          const id = create.id as number;
          const publicId = create.publicId as string;

          // Upload video if provided
          if (videoFile) {
            const fd = new FormData();
            fd.append("file", videoFile);
            const res = await fetch(`/api/v1/objects/${id}/video`, {
              method: "POST",
              body: fd,
            });
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              throw new Error(errorData.error || "Video upload failed");
            }
          }

          toast.success("Object created successfully");
          router.push(`/${publicId}`);
        } catch (e: any) {
          toast.error(e.message || "Failed to create object");
        }
      })();
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block mb-1.5 text-sm font-medium text-neutral-700">
          Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-9 w-full rounded-md px-3 border border-neutral-200 text-sm focus:border-neutral-300 focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block mb-1.5 text-sm font-medium text-neutral-700">
          Description
        </label>
        <TiptapEditor
          value={description}
          onChange={(value) => setDescription(value)}
          placeholder="Enter object description..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1.5 text-sm font-medium text-neutral-700">
            Collection
          </label>
          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            className="h-9 w-full rounded-md px-3 border border-neutral-200 text-sm focus:border-neutral-300 focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
          >
            <option value="">Select a collection…</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1.5 text-sm font-medium text-neutral-700">
            Category (optional)
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-9 w-full rounded-md px-3 border border-neutral-200 text-sm focus:border-neutral-300 focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input
          id="public"
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="w-4 h-4 rounded border-neutral-300 text-accent focus:ring-accent/20"
        />
        <label htmlFor="public" className="text-sm text-neutral-700">
          Make public (visible in app library)
        </label>
      </div>
      <div>
        <VideoUpload onUpload={handleVideoUpload} className="max-w-md" />
      </div>
      <div className="flex justify-end pt-2">
        <Button
          title={isPending ? "Creating..." : "Create"}
          onClick={submit}
          disabled={isPending}
        />
      </div>
    </div>
  );
}
