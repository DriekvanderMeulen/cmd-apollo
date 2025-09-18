"use client"

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { HiMiniMagnifyingGlass } from 'react-icons/hi2'
import { toast } from 'react-hot-toast'

import { Button, Spinner } from '@/components/ui'

type ObjectRow = {
  id: number
  publicId: string
  title: string
  description: string | null
  collectionId: number
  categoryId: number | null
  cfR2Link: string | null
  collectionTitle: string | null
  categoryTitle: string | null
}

async function apiGet(path: string) {
  const res = await fetch(path, { cache: 'no-store' })
  if (!res.ok) throw new Error('Request failed')
  return res.json()
}

const PAGE_SIZE = 10

export function ObjectsTable() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const page = Number(searchParams.get('page') || '1')
  const q = searchParams.get('q') || ''
  const sort = searchParams.get('sort') || 'title:asc'

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/?${params.toString()}`)
  }

  const [items, setItems] = useState<Array<ObjectRow>>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const qs = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE), q, sort })
        const res = await apiGet(`/api/v1/objects?${qs.toString()}`)
        if (cancelled) return
        setItems(res.items)
        setTotal(res.total)
      } catch (e) {
        if (!cancelled) toast.error('Failed to load objects')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [page, q, sort])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); setParam('page', '1') }} className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
            <HiMiniMagnifyingGlass size={18} />
          </div>
          <input
            type="search"
            defaultValue={q}
            onChange={(e) => setParam('q', e.target.value)}
            className="h-11 w-80 rounded-[8px] pl-10 pr-3.5 border border-neutral-200 outline-offset-0 outline-neutral-950 placeholder:text-neutral-400"
            placeholder="Search objects..."
          />
        </form>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-600">Sort</label>
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="h-9 rounded-[8px] border border-neutral-200 px-2"
          >
            <option value="title:asc">Title ↑</option>
            <option value="title:desc">Title ↓</option>
          </select>
          <Link href="/new-object" className="inline-flex items-center rounded-[8px] bg-neutral-900 px-3.5 py-2 text-black">
            New object
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-[8px] border border-neutral-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Collection</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">No objects.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-6 py-4 text-neutral-900">{item.title}</td>
                  <td className="px-6 py-4 text-neutral-700">{item.collectionTitle || '—'}</td>
                  <td className="px-6 py-4 text-neutral-700">{item.categoryTitle || '—'}</td>
                  <td className="px-6 py-4">
                    <Link href={`/${item.publicId}`} className="px-2 py-1 rounded-[8px] hover:bg-neutral-100">Edit</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-neutral-600">
        <span>Showing {items.length} of {total}</span>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 rounded-[8px] hover:bg-neutral-100 disabled:opacity-50"
            onClick={() => setParam('page', String(Math.max(1, page - 1)))}
            disabled={page <= 1}
          >Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button
            className="px-2 py-1 rounded-[8px] hover:bg-neutral-100 disabled:opacity-50"
            onClick={() => setParam('page', String(Math.min(totalPages, page + 1)))}
            disabled={page >= totalPages}
          >Next</button>
        </div>
      </div>
    </div>
  )
}


