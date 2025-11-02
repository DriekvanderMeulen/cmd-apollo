import type { Item } from './types'

export const mockItems: Array<Item> = [
	{
		id: 'orion',
		slug: 'orion-energy-hub',
		title: 'Orion Energy Hub',
		summary: 'Immersive walkthrough of the Orion control room showcasing adaptive lighting and live grid orchestration.',
		iterations: [
			{
				id: 'orion-alpha',
				order: 1,
				title: 'Launch Simulation',
				summary: 'First pass render with simulated telemetry overlays and operator gestures.',
				videoKey: 'demo/orion/alpha.mp4',
				posterKey: 'demo/orion/alpha.jpg'
			},
			{
				id: 'orion-beta',
				order: 2,
				title: 'Real-Time Grid View',
				summary: 'Live data integration with adaptive tone mapping for night mode operators.',
				videoKey: 'demo/orion/beta.mp4',
				posterKey: 'demo/orion/beta.jpg'
			}
		],
		updatedAt: '2024-10-12T09:32:00.000Z'
	},
	{
		id: 'helio',
		slug: 'helio-solar-suite',
		title: 'Helio Solar Suite',
		summary: 'Field deployment companion that helps inspectors validate solar arrays with assisted reality overlays.',
		iterations: [
			{
				id: 'helio-alpha',
				order: 1,
				title: 'Thermal Scan Overview',
				summary: 'Thermal layer proof of concept with annotated hotspots.',
				videoKey: 'demo/helio/alpha.mp4',
				posterKey: 'demo/helio/alpha.jpg'
			},
			{
				id: 'helio-beta',
				order: 2,
				title: 'Inspector Walkthrough',
				summary: 'Hand-tracked walkthrough with note taking and offline cache demo.',
				videoKey: 'demo/helio/beta.mp4',
				posterKey: 'demo/helio/beta.jpg'
			}
		],
		updatedAt: '2024-09-01T14:05:00.000Z'
	}
]

