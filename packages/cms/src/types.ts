import { z } from 'zod'

export const IterationSchema = z.object({
	id: z.string(),
	order: z.number(),
	title: z.string(),
	summary: z.string().nullable(),
	videoKey: z.string().nullable(),
	posterKey: z.string().nullable()
})

export const ItemSchema = z.object({
	id: z.string(),
	slug: z.string(),
	title: z.string(),
	summary: z.string(),
	iterations: z.array(IterationSchema).min(0),
	updatedAt: z.string()
})

export type Iteration = z.infer<typeof IterationSchema>
export type Item = z.infer<typeof ItemSchema>

export interface CmsClient {
	getItemById(id: string): Promise<Item>
	getItemBySlug(slug: string): Promise<Item>
}

export interface CmsClientConfig {
	baseUrl: string
	accessToken?: string
	fetchImplementation?: typeof fetch
}

export class CmsNotFoundError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'CmsNotFoundError'
	}
}

export class CmsRequestError extends Error {
	readonly status: number

	constructor(message: string, status: number) {
		super(message)
		this.name = 'CmsRequestError'
		this.status = status
	}
}

