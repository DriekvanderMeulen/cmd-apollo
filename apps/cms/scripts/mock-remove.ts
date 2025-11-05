#!/usr/bin/env tsx

import { config } from 'dotenv'
import path from 'path'
import { readFileSync } from 'fs'
import postgres from 'postgres'

// Load environment variables from .env BEFORE importing db
try {
	config({ path: path.join(__dirname, '..', '.env') })
} catch (error) {
	console.warn('Could not load .env file:', error)
}

// Create a direct database connection for seeding
const databaseUrl =
	process.env.DATABASE_URL ||
	process.env.RAILWAY_DB_URL ||
	process.env.POSTGRES_URL

let connectionString: string
if (databaseUrl) {
	connectionString = databaseUrl
} else {
	const host = process.env.DATABASE_HOST || 'localhost'
	const user = process.env.DATABASE_USER || 'postgres'
	const database = process.env.DATABASE_NAME || 'apollo'
	const password = process.env.DATABASE_PASSWORD || ''
	const port = process.env.DATABASE_PORT || '5432'

	connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}`
}

const client = postgres(connectionString, {
	ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
})

async function mockRemove() {
	console.log('🗑️  Starting mock data removal...')

	try {
		const sqlFile = readFileSync(
			path.join(__dirname, 'mock_remove.sql'),
			'utf-8'
		)

		await client.unsafe(sqlFile)

		console.log('✅ Mock data removal completed successfully!')
	} catch (error) {
		console.error('❌ Error removing mock data:', error)
		process.exit(1)
	} finally {
		await client.end()
	}
}

mockRemove()
	.then(() => {
		console.log('✨ Mock removal completed')
		process.exit(0)
	})
	.catch((error) => {
		console.error('❌ Mock removal failed:', error)
		process.exit(1)
	})

