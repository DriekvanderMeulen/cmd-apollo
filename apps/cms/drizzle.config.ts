import { defineConfig } from 'drizzle-kit'

const nodeEnv = process.env.NODE_ENV
const prodUrl =
  process.env.MYSQL_PUBLIC_URL || process.env.RAILWAY_DB_URL || process.env.DATABASE_URL

const host = process.env.DATABASE_HOST
const user = process.env.DATABASE_USER
const database = process.env.DATABASE_NAME
const password = process.env.DATABASE_PASSWORD
const port = process.env.DATABASE_PORT

type UrlCredentials = { url: string }
type HostCredentials = {
  host: string
  database: string
  user?: string
  password?: string
  port?: number
}

let dbCredentials: UrlCredentials | HostCredentials

if (nodeEnv === 'production') {
  if (!prodUrl) {
    throw new Error('MYSQL_PUBLIC_URL (or DATABASE_URL/RAILWAY_DB_URL) is required in production')
  }
  dbCredentials = { url: prodUrl }
} else {
  if (!host || !user || !database) {
    throw new Error('DATABASE_HOST, DATABASE_USER and DATABASE_NAME are required in development')
  }
  dbCredentials = {
    host,
    user,
    database,
    password,
    port: port ? Number(port) : undefined, // port is only needed when pushing to production
  }
}

export default defineConfig({
  schema: './db/schema/index.ts',
  dialect: 'mysql',
  dbCredentials,
  verbose: true,
  strict: true,
})
