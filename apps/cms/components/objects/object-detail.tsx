"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui";
import { QRCodeCanvas } from "qrcode.react";
import { VideoUpload } from "./video-upload";
import { IterationForm } from "./iteration-form";
import { TiptapEditor } from "./tiptap-editor";
import Dialog from "@/components/ui/dialog";

type ObjectRow = {
  id: number;
  publicId: string;
  title: string;
  description: string | null;
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
  description: string | null;
  createdAt: string;
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
  const [description, setDescription] = useState<string | object | null>(null);
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
        // Handle description - could be string or JSON object
        if (row.description === null || row.description === '') {
          setDescription(null);
        } else if (typeof row.description === 'string') {
          // Try to parse as JSON, if it fails, it's plain text
          try {
            const parsed = JSON.parse(row.description);
            setDescription(parsed);
          } catch {
            // Plain text, keep as string (will be converted by editor)
            setDescription(row.description);
          }
        } else {
          setDescription(row.description);
        }
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
          // Convert description to appropriate format
          let descriptionValue: string | object | null = null;
          if (description !== null) {
            if (typeof description === 'string') {
              descriptionValue = description.trim() || null;
            } else {
              descriptionValue = description;
            }
          }
          await apiJson(`/api/v1/objects/public/${publicId}`, "PATCH", {
            title: titleTrim || null,
            description: descriptionValue,
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
    description: string | object | null;
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

	const controlClassName =
		'h-10 w-full rounded-lg border border-[rgba(var(--border),0.9)] bg-[rgb(var(--surface))] px-3 text-sm text-[rgb(var(--color-neutral-900))] shadow-sm outline-none transition duration-150 ease-out placeholder:text-[rgb(var(--color-neutral-500))] focus:border-[rgba(var(--ring),0.7)] focus:ring-2 focus:ring-[rgba(var(--ring),0.22)]';

	const labelClassName =
		'mb-1.5 block text-sm font-medium text-[rgb(var(--color-neutral-700))]';

  if (!data) return <div className="text-sm text-[rgb(var(--color-neutral-500))]">Loading...</div>;

  return (
    <div className="space-y-6">
			<div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
				<div className="space-y-6">
					<section className="rounded-2xl border border-[rgba(var(--border),0.9)] bg-[rgb(var(--surface))] p-5 shadow-sm">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.08em] text-[rgb(var(--color-neutral-500))]">
									Object
								</p>
								<h2 className="text-lg font-semibold text-[rgb(var(--color-neutral-900))]">
									Details
								</h2>
							</div>
							<span className="rounded-full bg-[rgba(var(--color-primary),0.1)] px-3 py-1 text-xs font-semibold text-[rgb(var(--color-primary))]">
								{publicId}
							</span>
						</div>

						<div className="mt-5 space-y-5">
							<div>
								<label className={labelClassName}>
									Title
								</label>
								<input
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									className={controlClassName}
									placeholder="Name your object"
								/>
							</div>
							<div>
								<label className={labelClassName}>
									Description
								</label>
								<TiptapEditor
									value={description}
									onChange={(value) => setDescription(value)}
									placeholder="Enter object description..."
								/>
							</div>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
								<div>
									<label className={labelClassName}>
										Collection
									</label>
									<select
										value={collectionId}
										onChange={(e) => setCollectionId(e.target.value)}
										className={controlClassName}
									>
										<option value="">Select a collection...</option>
										{collections.map((c) => (
											<option key={c.id} value={c.id}>
												{c.title}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className={labelClassName}>
										Category (optional)
									</label>
									<select
										value={categoryId}
										onChange={(e) => setCategoryId(e.target.value)}
										className={controlClassName}
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
						</div>
					</section>

					<section className="rounded-2xl border border-[rgba(var(--border),0.9)] bg-[rgb(var(--surface))] p-5 shadow-sm">
						<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.08em] text-[rgb(var(--color-neutral-500))]">
									Iterations
								</p>
								<p className="text-sm text-[rgb(var(--color-neutral-700))]">
									Track changes and history over time
								</p>
							</div>
							<Button
								variant="secondary"
								onClick={() => {
									setEditingIteration(null);
									setShowIterationForm(true);
								}}
							>
								Add iteration
							</Button>
						</div>

						{iterations.length > 0 ? (
							<div className="space-y-3">
								{iterations.map((iteration) => (
									<div
										key={iteration.id}
										className="rounded-xl border border-[rgba(var(--border),0.9)] bg-[rgb(var(--surface))] p-4 shadow-sm"
									>
										<div className="mb-3 flex flex-wrap items-start justify-between gap-3">
											<div>
												<h4 className="text-base font-semibold text-[rgb(var(--color-neutral-900))]">
													{iteration.title}
												</h4>
												<p className="text-xs font-semibold uppercase tracking-[0.08em] text-[rgb(var(--color-neutral-500))]">
													{new Date(iteration.date).toLocaleDateString()}
												</p>
											</div>
											<div className="flex flex-wrap gap-2">
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
										{iteration.description ? (
											<p className="text-sm leading-relaxed text-[rgb(var(--color-neutral-700))] whitespace-pre-wrap">
												{typeof iteration.description === 'string'
													? iteration.description
													: extractPlainText(iteration.description) || ''}
											</p>
										) : null}
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-[rgb(var(--color-neutral-500))]">
								No iterations yet. Click "Add iteration" to create one.
							</p>
						)}
					</section>
				</div>

				<div className="space-y-6">
					<section className="rounded-2xl border border-[rgba(var(--border),0.9)] bg-[rgb(var(--surface))] p-5 shadow-sm">
						<div className="mb-4 flex items-start justify-between gap-3">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.08em] text-[rgb(var(--color-neutral-500))]">
									Media
								</p>
								<p className="text-sm text-[rgb(var(--color-neutral-700))]">
									Upload an optional video for this object
								</p>
							</div>
							<span
								className={
									data?.videoR2Key
										? 'rounded-full bg-[rgba(var(--color-primary),0.12)] px-3 py-1 text-xs font-semibold text-[rgb(var(--color-primary))]'
										: 'rounded-full bg-[rgba(var(--color-neutral-500),0.12)] px-3 py-1 text-xs font-semibold text-[rgb(var(--color-neutral-700))]'
								}
							>
								{data?.videoR2Key ? 'Attached' : 'Optional'}
							</span>
						</div>
						<VideoUpload
							onUpload={handleVideoUpload}
							onDelete={handleVideoDelete}
							existingVideoKey={data?.videoR2Key}
							existingVideoUrl={
								data?.videoR2Key
									? `/api/v1/r2/public/object?key=${data.videoR2Key}`
									: undefined
							}
							className="w-full"
						/>
					</section>

					<section className="rounded-2xl border border-[rgba(var(--border),0.9)] bg-[rgb(var(--surface))] p-5 shadow-sm">
						<div className="mb-3">
							<p className="text-xs font-semibold uppercase tracking-[0.08em] text-[rgb(var(--color-neutral-500))]">
								Actions
							</p>
							<p className="text-sm text-[rgb(var(--color-neutral-700))]">
								Save updates, download QR, or remove the object.
							</p>
						</div>
						<div className="flex flex-col gap-3">
							<div className="flex flex-wrap gap-3">
								<Button
									variant="secondary"
									onClick={generateAndDownloadQr}
									disabled={isPending}
								>
									Download QR
								</Button>
								<Button onClick={save} disabled={isPending}>
									{isPending ? 'Saving...' : 'Save changes'}
								</Button>
							</div>
							<div className="flex flex-wrap gap-3">
								<Button variant="danger" onClick={destroy} disabled={isPending}>
									Delete object
								</Button>
							</div>
						</div>
					</section>
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
                    description: (() => {
                      if (editingIteration.description === null || editingIteration.description === '') {
                        return null;
                      }
                      if (typeof editingIteration.description === 'string') {
                        try {
                          return JSON.parse(editingIteration.description);
                        } catch {
                          return editingIteration.description;
                        }
                      }
                      return editingIteration.description;
                    })(),
                  }
                : undefined
            }
            objectPublicId={publicId}
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
