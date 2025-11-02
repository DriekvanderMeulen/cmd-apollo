type AnalyticsEvent =
	| { type: 'item_open'; itemId: string; origin: 'deep-link' | 'history' }
	| { type: 'iteration_view'; itemId: string; iterationId: string; order: number }
	| { type: 'video_ended'; itemId: string; iterationId: string; durationSeconds: number }

export function logAnalyticsEvent(event: AnalyticsEvent): void {
	const timestamp = new Date().toISOString()
	console.info('[analytics]', timestamp, event)
}

