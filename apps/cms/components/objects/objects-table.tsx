"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { toast } from "react-hot-toast";

import { Button, Spinner } from "@/components/ui";

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
        >
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <HiMiniMagnifyingGlass size={18} />
          </div>
          <input
            type="search"
            defaultValue={q}
            onChange={(e) => setParam("q", e.target.value)}
            className="h-9 w-80 rounded-md pl-9 pr-3 border border-neutral-200 text-sm focus:border-neutral-300 focus:ring-1 focus:ring-accent/20 outline-none placeholder:text-neutral-400 transition-colors"
            placeholder="Search objects..."
          />
        </form>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-600 font-medium">Sort</label>
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="h-9 rounded-md border border-neutral-200 px-3 text-sm focus:border-neutral-300 focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
          >
            <option value="title:asc">Title ↑</option>
            <option value="title:desc">Title ↓</option>
          </select>
        
          <Link
            href="/new-object"
            className="inline-flex border-1 border-black items-center rounded-md bg-neutral-800 px-3.5 py-2 text-sm font-medium text-black hover:bg-neutral-900 transition-colors shadow-sm"
          >
            New object
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full">
          <thead className="bg-neutral-50/60 border-b border-neutral-200">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600">
                Title
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600">
                Collection
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600">
                Category
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
                    <Link
                      href={`/${item.publicId}`}
                      className="text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                    >
                      Edit
                    </Link>
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
          <button
            className="px-3 py-1.5 rounded-md text-sm font-medium hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            onClick={() => setParam("page", String(Math.max(1, page - 1)))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-3 py-1.5 rounded-md text-sm font-medium hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            onClick={() =>
              setParam("page", String(Math.min(totalPages, page + 1)))
            }
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
