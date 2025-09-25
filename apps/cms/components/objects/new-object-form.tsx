"use client"

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

import { Button, Spinner } from '@/components/ui'

async function apiJson(path: string, method: 'POST' | 'PATCH' | 'DELETE', body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error('Request failed')
  return res.json()
}

export function NewObjectForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [collectionId, setCollectionId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [collections, setCollections] = useState<Array<{ id: number; title: string }>>([])
  const [categories, setCategories] = useState<Array<{ id: number; title: string }>>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [colsRes, catsRes] = await Promise.all([
          fetch('/api/v1/objects/eligible-collections', { cache: 'no-store' }),
          fetch('/api/v1/objects/categories', { cache: 'no-store' }),
        ])
        if (!colsRes.ok || !catsRes.ok) throw new Error('load failed')
        const cols = await colsRes.json()
        const cats = await catsRes.json()
        if (cancelled) return
        setCollections(cols.items || [])
        setCategories(cats.items || [])
      } catch (e) {}
    })()
    return () => { cancelled = true }
  }, [])
  const [files, setFiles] = useState<Array<File | null>>([null, null, null, null, null])
  const [isPublic, setIsPublic] = useState(false)

  const submit = () => {
    const titleTrim = title.trim()
    const collectionNum = Number(collectionId)
    if (!titleTrim) return toast.error('Title is required')
    if (!Number.isFinite(collectionNum)) return toast.error('Collection ID is required')
    startTransition(() => {
      ;(async () => {
        try {
          const create = await apiJson('/api/v1/objects', 'POST', {
            title: titleTrim,
            description: description.trim() || null,
            collectionId: collectionNum,
            categoryId: categoryId ? Number(categoryId) : null,
            public: isPublic,
          })
          const id = create.id as number
          const publicId = create.publicId as string
          for (let i = 0; i < files.length; i++) {
            const f = files[i]
            if (!f) continue
            const fd = new FormData()
            fd.append('file', f)
            const res = await fetch(`/api/v1/objects/${id}/files/${i + 1}`, { method: 'POST', body: fd })
            if (!res.ok) throw new Error('Upload failed')
          }
          toast.success('Created')
          router.push(`/${publicId}`)
        } catch (e) {
          toast.error('Failed to create')
        }
      })()
    })
  }

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
      <div className="flex items-center gap-3">
        <input id="public" type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        <label htmlFor="public" className="text-sm text-neutral-700">Make public (visible in app library)</label>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium text-neutral-700">Files (up to 5 iterations)</div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {files.map((_, idx) => (
            <label key={idx} className="flex flex-col items-stretch rounded-[8px] border border-neutral-200 bg-white p-3 hover:border-neutral-300">
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
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <Button title={isPending ? 'Creating...' : 'Create'} onClick={submit} disabled={isPending} />
      </div>
    </div>
  )
}


