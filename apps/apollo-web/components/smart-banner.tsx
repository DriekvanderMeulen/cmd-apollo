'use client'

import type { CSSProperties } from 'react'
import { theme } from '@repo/ui/theme'

interface SmartBannerProps {
	onOpenApp(): void
	onOpenBrowser(): void
	onOpenStore(): void
	isContentVisible: boolean
}

export function SmartBanner(props: SmartBannerProps): JSX.Element {
	const { onOpenApp, onOpenBrowser, onOpenStore, isContentVisible } = props
	return (
		<aside
			style={{
				position: 'sticky',
				top: 0,
				width: '100%',
				zIndex: 20,
				background: 'rgba(17,17,17,0.92)',
				borderBottom: '1px solid rgba(255,255,255,0.12)'
			}}
		>
			<div
				style={{
					margin: '0 auto',
					maxWidth: 960,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: '1rem',
					padding: '0.75rem 1.5rem'
				}}
			>
				<div style={{ display: 'grid', gap: '0.25rem' }}>
					<span style={{ fontWeight: 600, letterSpacing: 0.2 }}>Apollo</span>
					<span style={{ fontSize: '0.9rem', color: 'rgba(249,250,251,0.72)' }}>{isContentVisible ? 'Viewing in browser' : 'Opening Apollo app…'}</span>
				</div>
				<div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
					<button type='button' onClick={onOpenApp} style={primaryButtonStyle}>
						Open App
					</button>
					<button type='button' onClick={onOpenBrowser} style={secondaryButtonStyle}>
						Open in browser
					</button>
					<button type='button' onClick={onOpenStore} style={ghostButtonStyle}>
						Store
					</button>
				</div>
			</div>
		</aside>
	)
}

const primaryButtonStyle: CSSProperties = {
	padding: '0.5rem 1.1rem',
	borderRadius: 999,
	border: 'none',
	background: theme.color.primary.dark,
	color: '#0a0a0a',
	fontWeight: 600,
	cursor: 'pointer'
}

const secondaryButtonStyle: CSSProperties = {
	padding: '0.5rem 1.1rem',
	borderRadius: 999,
	border: '1px solid rgba(248,113,113,0.6)',
	background: 'transparent',
	color: theme.color.primary.dark,
	fontWeight: 600,
	cursor: 'pointer'
}

const ghostButtonStyle: CSSProperties = {
	padding: '0.5rem 1.1rem',
	borderRadius: 999,
	border: '1px solid rgba(249,250,251,0.24)',
	background: 'transparent',
	color: '#f9fafb',
	fontWeight: 600,
	cursor: 'pointer'
}

