"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  HiMiniMagnifyingGlass,
  HiChevronLeft,
  HiChevronRight,
  HiMiniPlus,
} from "react-icons/hi2";
import { toast } from "react-hot-toast";

import { Dropdown, Spinner, Tabs, Button, Dialog } from "@/components/ui";
// Client-side API helpers
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

function listCategories(params: { page: number; pageSize: number; q: string }) {
  const qs = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    q: params.q,
  });
  return apiGet(`/api/v1/categories?${qs.toString()}`);
}

function createCategory(input: { title: string }) {
  return apiJson("/api/v1/categories", "POST", input);
}

function updateCategory(input: { id: number; title: string }) {
  return apiJson(`/api/v1/categories/${input.id}`, "PATCH", {
    title: input.title,
  });
}

function deleteCategory(id: number) {
  return apiJson(`/api/v1/categories/${id}`, "DELETE");
}

function listTenants(params: { page: number; pageSize: number; q: string }) {
  const qs = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    q: params.q,
  });
  return apiGet(`/api/v1/tenants?${qs.toString()}`);
}

function createTenant(input: { name: string }) {
  return apiJson("/api/v1/tenants", "POST", input);
}

function updateTenant(input: { id: number; name: string }) {
  return apiJson(`/api/v1/tenants/${input.id}`, "PATCH", { name: input.name });
}

function deleteTenant(id: number) {
  return apiJson(`/api/v1/tenants/${id}`, "DELETE");
}

function listCollections(params: {
  page: number;
  pageSize: number;
  q: string;
}) {
  const qs = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    q: params.q,
  });
  return apiGet(`/api/v1/collections?${qs.toString()}`);
}

function createCollection(input: { tenantId: number; title: string }) {
  return apiJson("/api/v1/collections", "POST", input);
}

function updateCollection(input: { id: number; title: string }) {
  return apiJson(`/api/v1/collections/${input.id}`, "PATCH", {
    title: input.title,
  });
}

function deleteCollection(id: number) {
  return apiJson(`/api/v1/collections/${id}`, "DELETE");
}

const PAGE_SIZE = 6;

type TabKey = "categories" | "tenants" | "collections";

function Pager({
  page,
  total,
  onPage,
}: {
  page: number;
  total: number;
  onPage: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <div className="flex items-center space-x-2">
      <button
        className="px-3 py-1.5 rounded-md text-sm font-medium hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page <= 1}
      >
        Prev
      </button>
      <span className="text-sm text-neutral-600">
        Page {page} of {totalPages}
      </span>
      <button
        className="px-3 py-1.5 rounded-md text-sm font-medium hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        onClick={() => onPage(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
}

function SectionHeader({
  title,
  onCreate,
}: {
  title: string;
  onCreate: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 rounded-md bg-neutral-800 px-3.5 py-2 text-sm font-medium text-white hover:bg-neutral-900 transition-colors shadow-sm"
      >
        <HiMiniPlus size={16} />
        Create
      </button>
    </div>
  );
}

export function EditorPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const tab = (searchParams.get("tab") as TabKey) || "categories";
  const page = Number(searchParams.get("page") || "1");

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/editor?${params.toString()}`);
  };

  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");

  // Modal state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [inputTitle, setInputTitle] = useState("");
  const [inputTenantId, setInputTenantId] = useState<string>("");

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Fetch data when tab/page/query changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (tab === "categories") {
          const res = await listCategories({
            page,
            pageSize: PAGE_SIZE,
            q: query,
          });
          if (cancelled) return;
          setItems(res.items);
          setTotal(res.total);
        } else if (tab === "tenants") {
          const res = await listTenants({
            page,
            pageSize: PAGE_SIZE,
            q: query,
          });
          if (cancelled) return;
          // Sort tenants: first by year (most recent first) if available, then alphabetically
          const extractYear = (name: string): number | null => {
            const match = name.match(/\d{4}/);
            return match ? parseInt(match[0], 10) : null;
          };
          const sorted = [...res.items].sort((a, b) => {
            const nameA = (a.name || a.title) ?? "";
            const nameB = (b.name || b.title) ?? "";
            const yearA = extractYear(nameA);
            const yearB = extractYear(nameB);

            // If both have years, sort by year descending
            if (yearA !== null && yearB !== null) {
              if (yearA !== yearB) return yearB - yearA;
            }
            // If only one has a year, prioritize it
            if (yearA !== null && yearB === null) return -1;
            if (yearA === null && yearB !== null) return 1;

            // Otherwise sort alphabetically
            return nameA.localeCompare(nameB);
          });
          setItems(sorted);
          setTotal(res.total);
        } else {
          const res = await listCollections({
            page,
            pageSize: PAGE_SIZE,
            q: query,
          });
          if (cancelled) return;
          setItems(res.items);
          setTotal(res.total);
        }
      } catch (e) {
        if (!cancelled) toast.error("Failed to load data");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, page, query]);

  const openCreateDialog = () => {
    setDialogMode("create");
    setActiveItem(null);
    setInputTitle("");
    setInputTenantId("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setDialogMode("edit");
    setActiveItem(item);
    setInputTitle(item.title || item.name || "");
    setIsDialogOpen(true);
  };

  const handleDelete = (item: any) => {
    if (!confirm("Delete? This cannot be undone.")) return;
    startTransition(() => {
      (async () => {
        try {
          if (tab === "categories") await deleteCategory(item.id);
          else if (tab === "tenants") await deleteTenant(item.id);
          else await deleteCollection(item.id);
          toast.success("Deleted");
          setParam("page", "1");
        } catch (e) {
          toast.error("Failed to delete");
        }
      })();
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (
      !confirm(
        `Delete ${selectedIds.length} selected item(s)? This cannot be undone.`,
      )
    )
      return;
    startTransition(() => {
      (async () => {
        try {
          for (const id of selectedIds) {
            if (tab === "categories") await deleteCategory(id);
            else if (tab === "tenants") await deleteTenant(id);
            else await deleteCollection(id);
          }
          toast.success("Deleted selected");
          setSelectedIds([]);
          setParam("page", "1");
        } catch (e) {
          toast.error("Failed to delete selection");
        }
      })();
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) setSelectedIds([]);
    else setSelectedIds(items.map((i) => i.id));
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const submitDialog = () => {
    const titleTrimmed = inputTitle.trim();
    if (!titleTrimmed) return toast.error("Title is required");
    startTransition(() => {
      (async () => {
        try {
          if (dialogMode === "create") {
            if (tab === "categories")
              await createCategory({ title: titleTrimmed });
            else if (tab === "tenants")
              await createTenant({ name: titleTrimmed });
            else {
              const tenantId = Number(inputTenantId);
              if (!Number.isFinite(tenantId))
                return toast.error("Valid tenant ID required");
              await createCollection({ title: titleTrimmed, tenantId });
            }
            toast.success("Created");
            setParam("page", "1");
          } else if (activeItem) {
            if (tab === "categories")
              await updateCategory({ id: activeItem.id, title: titleTrimmed });
            else if (tab === "tenants")
              await updateTenant({ id: activeItem.id, name: titleTrimmed });
            else
              await updateCollection({
                id: activeItem.id,
                title: titleTrimmed,
              });
            toast.success("Updated");
          }
          setIsDialogOpen(false);
        } catch (e) {
          toast.error("Action failed");
        }
      })();
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">Editor</h1>
          <p className="text-neutral-600 mt-1.5 text-[15px]">
            Manage categories, tenants and collections.
          </p>
        </div>

        <Tabs
          tabs={[
            { href: `/editor?tab=categories&page=1`, title: "Categories" },
            { href: `/editor?tab=tenants&page=1`, title: "Tenants" },
            { href: `/editor?tab=collections&page=1`, title: "Collections" },
          ]}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setParam("page", "1");
              }}
              className="relative"
            >
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <HiMiniMagnifyingGlass size={18} />
              </div>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-80 rounded-md pl-9 pr-3 border border-neutral-200 text-sm focus:border-neutral-300 focus:ring-1 focus:ring-accent/20 outline-none placeholder:text-neutral-400 transition-colors"
                placeholder={`Search ${tab}...`}
              />
            </form>
            <SectionHeader
              title={tab.charAt(0).toUpperCase() + tab.slice(1)}
              onCreate={openCreateDialog}
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            <table className="min-w-full">
              <thead className="bg-neutral-50/60 border-b border-neutral-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600">
                    Select
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600">
                    Title
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/60">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-12 text-center text-sm text-neutral-500"
                    >
                      No results.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <input
                          type="checkbox"
                          aria-label={`Select ${item.title || item.name}`}
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelectOne(item.id)}
                          className="w-4 h-4 rounded border-neutral-300 text-accent focus:ring-accent/20"
                        />
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-neutral-800">
                        {item.title || item.name}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            className="px-2.5 py-1.5 rounded-md text-sm font-medium hover:bg-neutral-100 transition-colors"
                            onClick={() => openEditDialog(item)}
                            disabled={isPending}
                          >
                            {isPending ? <Spinner size={14} /> : "Edit"}
                          </button>
                          <button
                            className="px-2.5 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => handleDelete(item)}
                            disabled={isPending}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm text-neutral-600">
            <span>
              Showing {items.length} of {total}
            </span>
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 ? (
                <Button
                  title={`Delete ${selectedIds.length} selected`}
                  variant="danger"
                  onClick={handleBulkDelete}
                />
              ) : null}
              <Pager
                page={page}
                total={total}
                onPage={(p) => setParam("page", String(p))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        title={
          dialogMode === "create"
            ? `Create ${tab.slice(0, 1).toUpperCase() + tab.slice(1)}`
            : `Edit ${tab.slice(0, 1).toUpperCase() + tab.slice(1)}`
        }
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
      >
        <div className="space-y-4">
          <label className="block">
            <div className="mb-1.5 text-sm font-medium text-neutral-700">
              {tab === "tenants" ? "Name" : "Title"}
            </div>
            <input
              type="text"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              className="h-9 w-full rounded-md px-3 border border-neutral-200 text-sm focus:border-neutral-300 focus:ring-1 focus:ring-accent/20 outline-none placeholder:text-neutral-400 transition-colors"
              placeholder={tab === "tenants" ? "Enter name" : "Enter title"}
            />
          </label>
          {tab === "collections" && dialogMode === "create" ? (
            <label className="block">
              <div className="mb-1.5 text-sm font-medium text-neutral-700">
                Tenant ID
              </div>
              <input
                type="number"
                value={inputTenantId}
                onChange={(e) => setInputTenantId(e.target.value)}
                className="h-9 w-full rounded-md px-3 border border-neutral-200 text-sm focus:border-neutral-300 focus:ring-1 focus:ring-accent/20 outline-none placeholder:text-neutral-400 transition-colors"
                placeholder="Enter tenant id"
              />
            </label>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              title="Cancel"
              variant="secondary-gray"
              onClick={() => setIsDialogOpen(false)}
            />
            <Button
              title={dialogMode === "create" ? "Create" : "Save"}
              onClick={submitDialog}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
