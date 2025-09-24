#!/usr/bin/env tsx

import { config } from 'dotenv'
import path from 'path'

// Load environment variables from .env BEFORE importing db
try {
  config({ path: path.join(__dirname, '..', '.env') })
} catch (error) {
  console.warn('Could not load .env file:', error)
}

import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { tenantTable, collectionTable, categoryTable } from '../db/schema'

// Create a direct database connection for seeding
const pool = mysql.createPool({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	database: process.env.DATABASE_NAME,
	password: process.env.DATABASE_PASSWORD || undefined,
})

const db = drizzle(pool, { mode: 'default' })

async function seed() {
	console.log('🌱 Starting database seed...')

	try {
		// Create categories (global, not tenant-specific)
		const categories = [
			'Photography',
			'Videography',
			'Visual Design',
			'Design Research',
			'development',
			'3D',
			'VR',
		]

		console.log('📂 Creating categories...')
		for (const categoryName of categories) {
			await db.insert(categoryTable).values({
				title: categoryName,
			})
		}
		console.log(`✅ Created ${categories.length} categories`)

		// Create tenants CMD-[A-C]-[YEAR] for 2022-2024
		const years = [2022, 2023, 2024]
		const letters = ['A', 'B', 'C']
		const tenants: Array<{ name: string; year: number }> = []

		console.log('🏢 Creating tenants...')
		for (const year of years) {
			for (const letter of letters) {
				const tenantName = `CMD-${letter}-${year}`
				tenants.push({ name: tenantName, year })

				await db.insert(tenantTable).values({
					name: tenantName,
				})
			}
		}
		console.log(`✅ Created ${tenants.length} tenants`)

		// Create collections for each tenant
		const collectionTypes = ['graduation', 'speculative-design', 'multi-media-story']

		console.log('📚 Creating collections...')
		let collectionCount = 0

		for (const tenant of tenants) {
			// Get the created tenant ID
			const [createdTenant] = await db
				.select({ id: tenantTable.id })
				.from(tenantTable)
				.where(eq(tenantTable.name, tenant.name))

			if (createdTenant) {
				for (const collectionType of collectionTypes) {
					const collectionTitle = `${collectionType}-${tenant.year}-${tenant.name}`

					await db.insert(collectionTable).values({
						title: collectionTitle,
						tenantId: createdTenant.id,
					})
					collectionCount++
				}
			}
		}
		console.log(`✅ Created ${collectionCount} collections`)

		console.log('🎉 Database seeding completed successfully!')
	} catch (error) {
		console.error('❌ Error seeding database:', error)
		process.exit(1)
	}
}

// Import eq from drizzle-orm at the top
seed()
	.then(() => {
		console.log('✨ Seed completed')
		process.exit(0)
	})
	.catch((error) => {
		console.error('❌ Seed failed:', error)
		process.exit(1)
	})
