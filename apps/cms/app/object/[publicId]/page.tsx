import Image from 'next/image'
type PublicObject = {
	id: number
	publicId: string
	title: string | null
	description: string | null
	collectionId: number | null
	categoryId: number | null
	cfR2Link: string | null
}

async function fetchPublicObject(publicId: string): Promise<PublicObject | null> {
	const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/v1/app/objects/public/${publicId}`, {
		cache: 'no-store',
		// Ensure this works on both serverless and edge without cookies
		next: { revalidate: 0 },
	})
	if (!res.ok) return null
	return res.json()
}

type R2ListResponse = {
	data: Array<{ key: string; size: number | null; etag: string | null; lastModified: string | null }>
}

async function fetchR2Files(publicId: string): Promise<Array<string>> {
	const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/v1/app/objects/public/${publicId}/r2`, {
		cache: 'no-store',
		next: { revalidate: 0 },
	})
	if (!res.ok) return []
	const json = (await res.json()) as R2ListResponse
	return json.data.map((d) => d.key)
}

function pickPosterKey(keys: Array<string>): string | null {
	if (keys.length === 0) return null
	const imageRegex = /\.(jpe?g|png|webp)$/i
	const prioritized = keys
		.filter((k) => imageRegex.test(k))
		.sort((a, b) => {
			const ap = /poster/i.test(a) ? 0 : 1
			const bp = /poster/i.test(b) ? 0 : 1
			return ap - bp
		})
	return prioritized[0] ?? null
}

export default async function Page({ params }: { params: Promise<{ publicId: string }> }) {
	const { publicId } = await params
	console.log('publicId', publicId)

	const obj = await fetchPublicObject(publicId)
	const keys = await fetchR2Files(publicId)
	const posterKey = pickPosterKey(keys)
	const posterUrl = posterKey
		? `/api/v1/app/r2/public/object?key=${encodeURIComponent(posterKey)}`
		: null

	return (
		<main className="mx-auto max-w-screen-sm p-4 space-y-4">
			<div className="rounded-md border bg-amber-50 p-3 text-amber-900">
				<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-sm">Install the Apollo app for the best experience</p>
					<div className="flex items-center gap-2">
						<a
							href="https://apps.apple.com/"
							className="rounded bg-black px-3 py-1.5 text-xs font-medium text-white"
							rel="noopener noreferrer"
							target="_blank"
						>
							iOS App Store
						</a>
						<a
							href="https://play.google.com/store/apps"
							className="rounded border border-black px-3 py-1.5 text-xs font-medium"
							rel="noopener noreferrer"
							target="_blank"
						>
							Google Play
						</a>
					</div>
				</div>
			</div>
			<h1 className="text-xl font-semibold">{obj?.title ?? 'Please install the app to view this content'}</h1>
			{obj?.description ? (
				<p className="text-sm text-gray-600">{obj.description}</p>
			) : null}
			{posterUrl ? (
				<div className="overflow-hidden rounded-md border">
					<Image
						src={posterUrl}
						alt={obj?.title ?? 'Poster'}
						width={1200}
						height={675}
						className="h-auto w-full object-cover"
						priority
						unoptimized
					/>
				</div>
			) : null}
		</main>
	)
}


