"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button, ButtonLink, Input, Select } from "@/components/ui";

type ObjectRow = {
  id: number;
  publicId: string;
  title: string;
  description: string | null;
  collectionId: number;
  categoryId: number | null;
  cfR2Link: string | null;
  collectionTitle: string | null;
  categoryTitle: string | null;
};

async function apiGet(path: string) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}

const PAGE_SIZE = 10;

export function ObjectsTable() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const page = Number(searchParams.get("page") || "1");
  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "title:asc";

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/?${params.toString()}`);
  };

  const [items, setItems] = useState<Array<ObjectRow>>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const qs = new URLSearchParams({
          page: String(page),
          pageSize: String(PAGE_SIZE),
          q,
          sort,
        });
        const res = await apiGet(`/api/v1/objects?${qs.toString()}`);
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
      } catch (e) {
        if (!cancelled) toast.error("Failed to load objects");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, q, sort]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam("page", "1");
          }}
          className="relative"
          role="search"
        >
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10">
            <Search size={18} aria-hidden="true" />
          </div>
          <Input
            type="search"
            defaultValue={q}
            onChange={(e) => setParam("q", e.target.value)}
            className="w-80 pl-9"
            placeholder="Search objects..."
            aria-label="Search objects"
          />
        </form>
        <div className="flex items-center gap-2">
          <label
            htmlFor="objects-sort"
            className="text-sm text-neutral-600 font-medium"
          >
            Sort
          </label>
          <Select
            id="objects-sort"
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
          >
            <option value="title:asc">Title ↑</option>
            <option value="title:desc">Title ↓</option>
          </Select>

          <ButtonLink href="/new-object" title="New object" />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full" aria-label="Objects list">
          <thead className="bg-neutral-50/60 border-b border-neutral-200">
            <tr>
              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold text-neutral-600"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold text-neutral-600"
              >
                Collection
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold text-neutral-600"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold text-neutral-600"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/60">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-12 text-center text-sm text-neutral-500"
                >
                  No objects.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-neutral-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-neutral-800">
                    {item.title}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-neutral-600">
                    {item.collectionTitle || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-neutral-600">
                    {item.categoryTitle || "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <ButtonLink
                      href={`/${item.publicId}`}
                      title="Edit"
                      aria-label={`Edit ${item.title}`}
                      variant="secondary"
                      size="sm"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-neutral-600">
        <span aria-live="polite">
          Showing {items.length} of {total}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setParam("page", String(Math.max(1, page - 1)))}
            disabled={page <= 1}
            aria-label="Go to previous page"
          >
            Prev
          </Button>
          <span className="text-sm" aria-current="page">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setParam("page", String(Math.min(totalPages, page + 1)))
            }
            disabled={page >= totalPages}
            aria-label="Go to next page"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
