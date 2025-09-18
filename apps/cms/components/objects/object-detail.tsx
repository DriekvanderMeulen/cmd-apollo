"use client"

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui'

type ObjectRow = {
  id: number
  publicId: string
  title: string
  description: string | null
  collectionId: number
  categoryId: number | null
  cfR2Link: string | null
  collectionTitle?: string | null
}

async function apiGet(path: string) {
  const res = await fetch(path, { cache: 'no-store' })
  if (!res.ok) throw new Error('Request failed')
  return res.json()
}

async function apiJson(path: string, method: 'POST' | 'PATCH' | 'DELETE', body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error('Request failed')
  return res.json()
}

export function ObjectDetail({ publicId }: { publicId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [data, setData] = useState<ObjectRow | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [collectionId, setCollectionId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [files, setFiles] = useState<Array<File | null>>([null, null, null, null, null])
  const [existing, setExisting] = useState<Array<{ key: string; iteration: number }>>([])
  const [collections, setCollections] = useState<Array<{ id: number; title: string }>>([])
  const [categories, setCategories] = useState<Array<{ id: number; title: string }>>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const row = await apiGet(`/api/v1/objects/public/${publicId}`)
        if (cancelled) return
        setData(row)
        setTitle(row.title)
        setDescription(row.description || '')
        setCollectionId(row.collectionId ? String(row.collectionId) : '')
        setCategoryId(row.categoryId ? String(row.categoryId) : '')
        // load existing iteration files
        try {
          const list = await apiGet(`/api/v1/objects/public/${publicId}/files`)
          if (!cancelled) setExisting(list.items || [])
        } catch {}
        // load selects
        try {
          const [colsRes, catsRes] = await Promise.all([
            fetch('/api/v1/objects/eligible-collections', { cache: 'no-store' }),
            fetch('/api/v1/objects/categories', { cache: 'no-store' }),
          ])
          if (colsRes.ok) {
            const cols = await colsRes.json()
            const items = cols.items || []
            // ensure current collection appears in options
            const hasCurrent = row.collectionId && items.some((c: any) => c.id === row.collectionId)
            const merged = hasCurrent || !row.collectionId
              ? items
              : [{ id: row.collectionId, title: row.collectionTitle || `Collection #${row.collectionId}` }, ...items]
            if (!cancelled) setCollections(merged)
          }
          if (catsRes.ok) {
            const cats = await catsRes.json()
            if (!cancelled) setCategories(cats.items || [])
          }
        } catch {}
      } catch (e) {
        if (!cancelled) toast.error('Failed to load')
      }
    })()
    return () => { cancelled = true }
  }, [publicId])

  const save = () => {
    const titleTrim = title.trim()
    startTransition(() => {
      ;(async () => {
        try {
          await apiJson(`/api/v1/objects/public/${publicId}`, 'PATCH', {
            title: titleTrim || null,
            description: description.trim() || null,
            collectionId: collectionId ? Number(collectionId) : undefined,
            categoryId: categoryId ? Number(categoryId) : null,
          })
          for (let i = 0; i < files.length; i++) {
            const f = files[i]
            if (!f) continue
            const fd = new FormData()
            fd.append('file', f)
            const res = await fetch(`/api/v1/objects/public/${publicId}/files/${i + 1}`, { method: 'POST', body: fd })
            if (!res.ok) throw new Error('Upload failed')
          }
          toast.success('Saved')
          router.refresh()
        } catch (e) {
          toast.error('Save failed')
        }
      })()
    })
  }

  const destroy = () => {
    if (!confirm('Delete this object?')) return
    startTransition(() => {
      ;(async () => {
        try {
          await apiJson(`/api/v1/objects/public/${publicId}`, 'DELETE')
          toast.success('Deleted')
          router.push('/')
        } catch (e) {
          toast.error('Delete failed')
        }
      })()
    })
  }

  if (!data) return <div className="text-neutral-500">Loading...</div>

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1 text-sm font-medium text-neutral-700">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 w-full rounded-[8px] px-3.5 border border-neutral-200" />
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium text-neutral-700">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-24 w-full rounded-[8px] px-3.5 py-2 border border-neutral-200" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-neutral-700">Collection</label>
          <select value={collectionId} onChange={(e) => setCollectionId(e.target.value)} className="h-11 w-full rounded-[8px] px-3.5 border border-neutral-200">
            <option value="">Select a collection…</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-neutral-700">Category (optional)</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="h-11 w-full rounded-[8px] px-3.5 border border-neutral-200">
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-neutral-700">Files (up to 5 iterations)</label>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[0,1,2,3,4].map((idx) => {
            const existingItem = existing.find((e) => e.iteration === idx + 1)
            return (
              <div key={idx} className="flex flex-col items-stretch rounded-[8px] border border-neutral-200 bg-white p-3 hover:border-neutral-300">
                <span className="mb-2 text-xs font-medium text-neutral-600">Iteration {idx + 1}</span>
                <input
                  type="file"
                  className="block w-full text-xs file:mr-3 file:rounded-[6px] file:border file:border-neutral-200 file:bg-neutral-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-neutral-700 hover:file:bg-neutral-100"
                  onChange={(e) => {
                    const next = files.slice()
                    next[idx] = e.target.files?.[0] || null
                    setFiles(next)
                  }}
                />
                {existingItem ? (
                  <button
                    className="mt-2 text-xs text-red-700 px-2 py-1 rounded-[6px] border border-red-200 hover:bg-red-50"
                    onClick={async () => {
                      try {
                        await fetch(`/api/v1/objects/public/${publicId}/files/${idx + 1}`, { method: 'DELETE' })
                        setExisting((prev) => prev.filter((p) => p.iteration !== idx + 1))
                        toast.success('Deleted iteration')
                      } catch {
                        toast.error('Delete failed')
                      }
                    }}
                  >Delete</button>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <Button title="Delete" variant="danger" onClick={destroy} />
        <Button title="Save" onClick={save} />
      </div>
    </div>
  )
}


