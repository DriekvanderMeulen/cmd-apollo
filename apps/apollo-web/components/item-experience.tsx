'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { Item } from 'cms/types'
import { theme, type ThemeMode } from '@repo/ui/theme'
import { getOverlayStops } from '@repo/ui/overlay'
import { getIterationArrowVisuals } from '@repo/ui/iteration-arrow'
import { SmartBanner } from './smart-banner'
import { getPresignedUrl } from '../lib/presign'

interface MediaPayload {
	videoUrl: string | null
	posterUrl: string | null
}

interface ItemExperienceProps {
	item: Item
	initialMedia: MediaPayload
}

const mode: ThemeMode = 'dark'

export function ItemExperience(props: ItemExperienceProps): JSX.Element {
	const { item, initialMedia } = props
	const [iterationIndex, setIterationIndex] = useState(0)
	const [currentMedia, setCurrentMedia] = useState<MediaPayload>(initialMedia)
	const [contentVisible, setContentVisible] = useState(false)
	const [mediaLoading, setMediaLoading] = useState(false)
	const mediaCacheRef = useRef(new Map<string, MediaPayload>())

	useEffect(() => {
		const firstIteration = item.iterations[0]
		if (firstIteration) {
			mediaCacheRef.current.set(firstIteration.id, initialMedia)
		}
	}, [item.iterations, initialMedia])

	useEffect(() => {
		if (typeof window === 'undefined') {
			return
		}
		attemptDeepLink(item.id)
	}, [item.id])

	const gradientBackground = useMemo(() => buildGradient(mode), [])
	const platform = useMemo(() => detectPlatform(), [])
	const storeUrl = useMemo(() => selectStoreUrl(platform), [platform])

	const iteration = item.iterations[iterationIndex] ?? null
	const hasNext = Boolean(item.iterations[iterationIndex + 1])
	const hasPrevious = iterationIndex > 0

	const handleOpenBrowser = useCallback(() => {
		setContentVisible(true)
	}, [])

	const handleOpenStore = useCallback(() => {
		if (!storeUrl) {
			return
		}
		window.open(storeUrl, '_blank', 'noopener,noreferrer')
	}, [storeUrl])

	const handleOpenApp = useCallback(() => {
		attemptDeepLink(item.id)
	}, [item.id])

	const updateIteration = useCallback(
		async (index: number) => {
			const target = item.iterations[index]
			if (!target) {
				return
			}
			setIterationIndex(index)
			const cached = mediaCacheRef.current.get(target.id)
			if (cached) {
				setCurrentMedia(cached)
				return
			}
			setMediaLoading(true)
			try {
				const [video, poster] = await Promise.all([getPresignedUrl(target.videoKey ?? null), getPresignedUrl(target.posterKey ?? null)])
				const payload: MediaPayload = { videoUrl: video?.url ?? null, posterUrl: poster?.url ?? null }
				mediaCacheRef.current.set(target.id, payload)
				setCurrentMedia(payload)
			} catch (error) {
				console.error('Failed to load iteration media', error)
			} finally {
				setMediaLoading(false)
			}
		},
		[item.iterations]
	)

	const handleNext = useCallback(() => {
		if (hasNext) {
			updateIteration(iterationIndex + 1).catch(console.error)
		}
	}, [hasNext, iterationIndex, updateIteration])

	const handlePrevious = useCallback(() => {
		if (hasPrevious) {
			updateIteration(iterationIndex - 1).catch(console.error)
		}
	}, [hasPrevious, iterationIndex, updateIteration])

	return (
		<div style={{ backgroundColor: theme.color.bg.dark, color: theme.color.text.dark, minHeight: '100vh' }}>
			<SmartBanner onOpenApp={handleOpenApp} onOpenBrowser={handleOpenBrowser} onOpenStore={handleOpenStore} isContentVisible={contentVisible} />
			<main style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem', display: 'grid', gap: '1.5rem' }}>
				<section
					style={{
						position: 'relative',
						borderRadius: 24,
						overflow: 'hidden',
						minHeight: '60vh',
						border: '1px solid rgba(248,113,113,0.2)',
						filter: contentVisible ? 'none' : 'blur(18px)',
						transition: 'filter 240ms ease'
					}}
				>
					{renderMedia(currentMedia, contentVisible, mediaLoading)}
					<div style={{ position: 'absolute', inset: 0, background: gradientBackground, pointerEvents: 'none' }} />
					<div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2.5rem', gap: '1.5rem' }}>
						{renderDetails(item, iteration)}
						<div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
							{renderArrow('previous', hasPrevious, handlePrevious)}
							{renderArrow('next', hasNext, handleNext)}
						</div>
					</div>
					{contentVisible ? null : <div style={blurOverlayStyle}>Tap “Open in browser” to view here.</div>}
				</section>
				<section style={{ display: 'grid', gap: '0.5rem' }}>
					<h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Iterations</h2>
					<div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
						{item.iterations.map((iter, index) => (
							<button
								key={iter.id}
								type='button'
								onClick={() => {
									updateIteration(index).catch(console.error)
								}}
								style={chipStyle(index === iterationIndex)}
							>
								<span style={{ fontWeight: 600 }}>#{iter.order}</span>
								<span>{iter.title}</span>
							</button>
						))}
					</div>
				</section>
			</main>
		</div>
	)
}

function renderMedia(media: MediaPayload, contentVisible: boolean, loading: boolean): JSX.Element {
	if (!contentVisible) {
		return media.posterUrl ? (
			<img src={media.posterUrl} alt='Poster placeholder' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
		) : (
			<div style={{ width: '100%', height: '100%', background: '#000000' }} />
		)
	}
	if (media.videoUrl) {
		return (
			<video
				src={media.videoUrl}
				poster={media.posterUrl ?? undefined}
				style={{ width: '100%', height: '100%', objectFit: 'cover' }}
				controls
				autoPlay
				playsInline
				muted
			/>
		)
	}
	if (media.posterUrl) {
		return <img src={media.posterUrl} alt='Iteration poster' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
	}
	return (
		<div style={{ width: '100%', height: '100%', background: '#0f172a', color: 'rgba(248,250,252,0.72)', display: 'grid', placeItems: 'center' }}>
			{loading ? 'Loading…' : 'Media unavailable'}
		</div>
	)
}

function renderDetails(item: Item, iteration: Item['iterations'][number] | null): JSX.Element {
	if (!iteration) {
		return (
			<div style={{ display: 'grid', gap: '0.5rem' }}>
				<h1 style={{ margin: 0, fontSize: '2.4rem', fontWeight: 600 }}>{item.title}</h1>
				<p style={{ margin: 0, maxWidth: 520, color: 'rgba(249,250,251,0.78)' }}>{item.summary}</p>
			</div>
		)
	}
	return (
		<div style={{ display: 'grid', gap: '0.5rem', maxWidth: 560 }}>
			<span style={{ textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: 1.4, color: 'rgba(248,250,252,0.6)' }}>Iteration {iteration.order}</span>
			<h1 style={{ margin: 0, fontSize: '2.4rem', fontWeight: 600 }}>{iteration.title || item.title}</h1>
			<p style={{ margin: 0, color: 'rgba(249,250,251,0.78)', lineHeight: 1.6 }}>{iteration.summary ?? item.summary}</p>
	</div>
	)
}

function renderArrow(direction: 'previous' | 'next', enabled: boolean, onPress: () => void): JSX.Element {
	const visuals = getIterationArrowVisuals({ direction, mode, disabled: !enabled })
	return (
		<button
			type='button'
			onClick={enabled ? onPress : undefined}
			disabled={!enabled}
			style={{
				width: 56,
				height: 56,
				borderRadius: 999,
				border: 'none',
				cursor: enabled ? 'pointer' : 'not-allowed',
				background: visuals.backgroundColor,
				backdropFilter: 'blur(12px)',
				transition: 'transform 150ms ease',
				display: 'grid',
				placeItems: 'center'
			}}
			aria-label={visuals.accessibilityLabel}
		>
			<svg width={22} height={32} viewBox={visuals.iconViewBox} fill='none' xmlns='http://www.w3.org/2000/svg'>
				<path d={visuals.iconPath} fill={visuals.foregroundColor} transform={visuals.chevronTransform} />
			</svg>
		</button>
	)
}

function chipStyle(active: boolean): CSSProperties {
	return {
		display: 'flex',
		gap: '0.35rem',
		alignItems: 'center',
		borderRadius: 999,
		padding: '0.35rem 0.9rem',
		border: active ? `1px solid ${theme.color.primary.dark}` : '1px solid rgba(248,113,113,0.24)',
		background: active ? 'rgba(248,113,113,0.16)' : 'transparent',
		color: 'rgba(248,250,252,0.84)',
		cursor: 'pointer'
	}
}

function buildGradient(mode: ThemeMode): string {
	const stops = getOverlayStops(mode)
	const parts = stops.map((stop) => `${toRgba(stop.color, stop.opacity)} ${Math.round(stop.position * 100)}%`)
	return `linear-gradient(180deg, ${parts.join(', ')})`
}

function toRgba(hex: string, opacity: number): string {
	const normalized = hex.replace('#', '')
	if (normalized.length !== 6) {
		return hex
	}
	const value = Number.parseInt(normalized, 16)
	const r = value >> 16
	const g = (value >> 8) & 255
	const b = value & 255
	return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

const blurOverlayStyle: CSSProperties = {
	position: 'absolute',
	left: '50%',
	bottom: '2.5rem',
	transform: 'translateX(-50%)',
	padding: '0.6rem 1.2rem',
	borderRadius: 999,
	background: 'rgba(10,10,10,0.72)',
	color: 'rgba(248,250,252,0.86)',
	fontWeight: 600
}

function detectPlatform(): 'ios' | 'android' | 'web' {
	if (typeof navigator === 'undefined') {
		return 'web'
	}
	const ua = navigator.userAgent.toLowerCase()
	if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
		return 'ios'
	}
	if (ua.includes('android')) {
		return 'android'
	}
	return 'web'
}

function selectStoreUrl(platform: 'ios' | 'android' | 'web'): string | null {
	if (platform === 'ios') {
		return process.env.NEXT_PUBLIC_IOS_APP_STORE_URL ?? null
	}
	if (platform === 'android') {
		return process.env.NEXT_PUBLIC_ANDROID_PLAY_STORE_URL ?? null
	}
	return process.env.NEXT_PUBLIC_IOS_APP_STORE_URL ?? process.env.NEXT_PUBLIC_ANDROID_PLAY_STORE_URL ?? null
}

function attemptDeepLink(itemId: string): void {
	if (typeof window === 'undefined') {
		return
	}
	const scheme = process.env.NEXT_PUBLIC_DEEP_LINK_SCHEME ?? 'apollo'
	const url = `${scheme}://item/${itemId}`
	setTimeout(() => {
		window.location.href = url
	}, 150)
}

