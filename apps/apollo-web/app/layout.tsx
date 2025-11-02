import type { ReactNode } from 'react'
import './globals.css'
import { theme } from '@repo/ui/theme'

export const metadata = {
	title: 'Apollo Portfolio',
	description: 'Apollo showcases immersive portfolio items and iteration history.'
}

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
	return (
		<html lang='en'>
			<body style={{ margin: 0, backgroundColor: theme.color.bg.dark, color: theme.color.text.dark }}>{children}</body>
		</html>
	)
}

