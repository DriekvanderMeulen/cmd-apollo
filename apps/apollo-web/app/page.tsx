import Link from 'next/link'
import { theme } from '@repo/ui/theme'

export default function HomePage(): JSX.Element {
	return (
		<main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', backgroundColor: theme.color.bg.dark, color: theme.color.text.dark }}>
			<div style={{ maxWidth: 640, textAlign: 'center', display: 'grid', gap: '1rem' }}>
				<h1 style={{ fontSize: '2.5rem', fontWeight: 600 }}>Apollo</h1>
				<p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>Scan a portfolio QR code to view an item. If you landed here directly, try opening a specific item link such as <Link href='/i/orion-energy-hub' style={{ color: theme.color.primary.dark }}>apollo-view</Link>.</p>
			</div>
		</main>
	)
}

