import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchItem } from '../../../lib/cms'
import { getPresignedUrl } from '../../../lib/presign'
import { ItemExperience } from '../../../components/item-experience'

interface ItemPageProps {
	params: { identifier: string }
}

export const revalidate = 30

export async function generateMetadata(props: ItemPageProps): Promise<Metadata> {
	const identifier = decodeURIComponent(props.params.identifier)
	try {
		const item = await fetchItem(identifier)
		const posterUrl = item.iterations[0]?.posterKey ? await resolvePosterUrl(item.iterations[0].posterKey) : null
		return {
			title: `${item.title} · Apollo`,
			description: item.summary,
			openGraph: {
				title: item.title,
				description: item.summary,
				images: posterUrl ? [{ url: posterUrl, width: 1200, height: 675, alt: item.title }] : undefined
			}
		}
	} catch (error) {
		console.warn('Unable to generate metadata for item', error)
		return { title: 'Apollo', description: 'Apollo portfolio viewer.' }
	}
}

export default async function ItemPage(props: ItemPageProps): Promise<JSX.Element> {
	const identifier = decodeURIComponent(props.params.identifier)
	let item
	try {
		item = await fetchItem(identifier)
	} catch (error) {
		console.warn('Failed to load item for web fallback', error)
		notFound()
	}
	const iteration = item.iterations[0] ?? null
	const [video, poster] = iteration
		? await Promise.all([getPresignedUrl(iteration.videoKey ?? null), getPresignedUrl(iteration.posterKey ?? null)])
		: [null, null]
	const initialMedia = { videoUrl: video?.url ?? null, posterUrl: poster?.url ?? null }
	return <ItemExperience item={item} initialMedia={initialMedia} />
}

async function resolvePosterUrl(key: string): Promise<string | null> {
	const asset = await getPresignedUrl(key)
	return asset?.url ?? null
}

