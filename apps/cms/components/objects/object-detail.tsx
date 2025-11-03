"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui";
import { QRCodeCanvas } from "qrcode.react";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { VideoUpload } from "./video-upload";
import { IterationForm } from "./iteration-form";
import Dialog from "@/components/ui/dialog";

type ObjectRow = {
  id: number;
  publicId: string;
  title: string;
  description: any;
  collectionId: number;
  categoryId: number | null;
  cfR2Link: string | null;
  videoR2Key: string | null;
  collectionTitle?: string | null;
};

type IterationRow = {
  id: number;
  objectId: number;
  title: string;
  date: string;
  description: any;
  createdAt: string;
};

async function apiGet(path: string) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}

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

export function ObjectDetail({ publicId }: { publicId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<ObjectRow | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<any>(null);
  const [collectionId, setCollectionId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [iterations, setIterations] = useState<Array<IterationRow>>([]);
  const [collections, setCollections] = useState<
    Array<{ id: number; title: string }>
  >([]);
  const [categories, setCategories] = useState<
    Array<{ id: number; title: string }>
  >([]);
  const [qrRenderKey, setQrRenderKey] = useState(0);
  const qrContainerRef = useRef<HTMLDivElement | null>(null);
  const [showIterationForm, setShowIterationForm] = useState(false);
  const [editingIteration, setEditingIteration] = useState<IterationRow | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const row = await apiGet(`/api/v1/objects/public/${publicId}`);
        if (cancelled) return;
        setData(row);
        setTitle(row.title);
        setDescription(row.description);
        setCollectionId(row.collectionId ? String(row.collectionId) : "");
        setCategoryId(row.categoryId ? String(row.categoryId) : "");
        // load iterations
        try {
          const list = await apiGet(
            `/api/v1/objects/public/${publicId}/iterations`,
          );
          if (!cancelled) setIterations(list.items || []);
        } catch {}
        // load selects
        try {
          const [colsRes, catsRes] = await Promise.all([
            fetch("/api/v1/objects/eligible-collections", {
              cache: "no-store",
            }),
            fetch("/api/v1/objects/categories", { cache: "no-store" }),
          ]);
          if (colsRes.ok) {
            const cols = await colsRes.json();
            const items = cols.items || [];
            // ensure current collection appears in options
            const hasCurrent =
              row.collectionId &&
              items.some((c: any) => c.id === row.collectionId);
            const merged =
              hasCurrent || !row.collectionId
                ? items
                : [
                    {
                      id: row.collectionId,
                      title:
                        row.collectionTitle ||
                        `Collection #${row.collectionId}`,
                    },
                    ...items,
                  ];
            if (!cancelled) setCollections(merged);
          }
          if (catsRes.ok) {
            const cats = await catsRes.json();
            if (!cancelled) setCategories(cats.items || []);
          }
        } catch {}
      } catch (e) {
        if (!cancelled) toast.error("Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [publicId]);

  const save = () => {
    const titleTrim = title.trim();
    startTransition(() => {
      (async () => {
        try {
          await apiJson(`/api/v1/objects/public/${publicId}`, "PATCH", {
            title: titleTrim || null,
            description: description,
            collectionId: collectionId ? Number(collectionId) : undefined,
            categoryId: categoryId ? Number(categoryId) : null,
          });
          toast.success("Saved");
          router.refresh();
        } catch (e) {
          toast.error("Save failed");
        }
      })();
    });
  };

  const handleVideoUpload = async (file: File) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/v1/objects/public/${publicId}/video`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed");
      }
      toast.success("Video uploaded successfully");
      // Reload the page data to show the new video
      const row = await apiGet(`/api/v1/objects/public/${publicId}`);
      setData(row);
    } catch (e: any) {
      toast.error(e.message || "Video upload failed");
    }
  };

  const handleVideoDelete = async () => {
    try {
      const res = await fetch(`/api/v1/objects/public/${publicId}/video`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Delete failed");
      }
      toast.success("Video deleted successfully");
      // Reload the page data to clear the video
      const row = await apiGet(`/api/v1/objects/public/${publicId}`);
      setData(row);
    } catch (e: any) {
      toast.error(e.message || "Video delete failed");
    }
  };

  const handleIterationSave = async (iterationData: {
    title: string;
    date: Date;
    description: any;
  }) => {
    try {
      if (editingIteration) {
        // Update existing iteration
        await apiJson(
          `/api/v1/objects/public/${publicId}/iterations/${editingIteration.id}`,
          "PATCH",
          {
            title: iterationData.title,
            date: iterationData.date.toISOString(),
            description: iterationData.description,
          },
        );
        toast.success("Iteration updated");
      } else {
        // Create new iteration
        await apiJson(`/api/v1/objects/public/${publicId}/iterations`, "POST", {
          title: iterationData.title,
          date: iterationData.date.toISOString(),
          description: iterationData.description,
        });
        toast.success("Iteration created");
      }
      setShowIterationForm(false);
      setEditingIteration(null);
      router.refresh();
    } catch (e) {
      toast.error("Failed to save iteration");
    }
  };

  const handleIterationDelete = async (iterationId: number) => {
    if (!confirm("Delete this iteration?")) return;
    try {
      await apiJson(
        `/api/v1/objects/public/${publicId}/iterations/${iterationId}`,
        "DELETE",
      );
      toast.success("Iteration deleted");
      router.refresh();
    } catch (e) {
      toast.error("Failed to delete iteration");
    }
  };

  const destroy = () => {
    if (!confirm("Delete this object?")) return;
    startTransition(() => {
      (async () => {
        try {
          await apiJson(`/api/v1/objects/public/${publicId}`, "DELETE");
          toast.success("Deleted");
          router.push("/");
        } catch (e) {
          toast.error("Delete failed");
        }
      })();
    });
  };

  const generateAndDownloadQr = async () => {
    try {
      const url = `https://app.apolloview.app/${publicId}`;
      // Render hidden QR by bumping key to ensure fresh canvas
      setQrRenderKey((k) => k + 1);
      await new Promise((r) => setTimeout(r, 50));
      const canvas = qrContainerRef.current?.querySelector(
        "canvas",
      ) as HTMLCanvasElement | null;
      if (!canvas) {
        toast.error("Failed to render QR");
        return;
      }
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `apolloview-${publicId}-qr.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("QR downloaded");
    } catch {
      toast.error("Failed to generate QR");
    }
  };

  if (!data) return <div className="text-sm text-neutral-500">Loading...</div>;

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
        <RichTextEditor
          content={description}
          onChange={setDescription}
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

      {/* Video Section */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-neutral-700">
          Video
        </label>
        <VideoUpload
          onUpload={handleVideoUpload}
          onDelete={handleVideoDelete}
          existingVideoKey={data?.videoR2Key}
          existingVideoUrl={
            data?.videoR2Key
              ? `/api/v1/r2/public/object?key=${data.videoR2Key}`
              : undefined
          }
          className="max-w-md"
        />
      </div>

      {/* Iterations Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-neutral-700">
            Iterations
          </label>
          <Button
            variant="secondary"
            onClick={() => {
              setEditingIteration(null);
              setShowIterationForm(true);
            }}
          >
            Add Iteration
          </Button>
        </div>

        {iterations.length > 0 ? (
          <div className="space-y-3">
            {iterations.map((iteration) => (
              <div
                key={iteration.id}
                className="border border-neutral-200 rounded-md p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-neutral-900">
                      {iteration.title}
                    </h4>
                    <p className="text-sm text-neutral-500">
                      {new Date(iteration.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingIteration(iteration);
                        setShowIterationForm(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleIterationDelete(iteration.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                {iteration.description && (
                  <div className="prose prose-sm max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          iteration.description?.content
                            ?.map((node: any) =>
                              node.type === "paragraph"
                                ? `<p>${node.content?.[0]?.text || ""}</p>`
                                : "",
                            )
                            .join("") || "",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">
            No iterations yet. Click "Add Iteration" to create one.
          </p>
        )}
      </div>

      <div className="flex justify-between gap-3 pt-2">
        <Button title="Delete" variant="danger" onClick={destroy} />
        <div className="flex gap-2">
          <Button
            title="Generate QR"
            variant="secondary"
            onClick={generateAndDownloadQr}
          />
          <Button title="Save" onClick={save} />
        </div>
      </div>

      {/* Hidden QR render target */}
      <div
        ref={qrContainerRef}
        style={{ position: "absolute", left: -99999, top: -99999 }}
        aria-hidden
      >
        <QRCodeCanvas
          key={qrRenderKey}
          value={`${window.location.origin}/${publicId}`}
          includeMargin
          size={1024}
          level="M"
        />
      </div>

      {/* Iteration Form Dialog */}
      <Dialog
        title={editingIteration ? "Edit Iteration" : "Add Iteration"}
        isOpen={showIterationForm}
        setIsOpen={(open) => {
          setShowIterationForm(open);
          if (!open) setEditingIteration(null);
        }}
      >
        <IterationForm
            initialData={
              editingIteration
                ? {
                    id: editingIteration.id,
                    title: editingIteration.title,
                    date: new Date(editingIteration.date),
                    description: editingIteration.description,
                  }
                : undefined
            }
            onSave={handleIterationSave}
            onCancel={() => {
              setShowIterationForm(false);
              setEditingIteration(null);
            }}
          />
      </Dialog>
    </div>
  );
}
