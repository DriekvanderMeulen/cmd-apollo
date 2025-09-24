import { drizzle } from "drizzle-orm/mysql2";
import mysql, { type PoolOptions } from "mysql2/promise";

import * as schema from "./schema";

// Check if we have a Railway URL (production)
const railwayUrl = process.env.MYSQL_PUBLIC_URL || process.env.RAILWAY_DB_URL || process.env.DATABASE_URL;

let pool: mysql.Pool;

if (railwayUrl) {
  // Use Railway URL for production
  const url = new URL(railwayUrl);
  const config: PoolOptions = {
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ssl: {
      rejectUnauthorized: false,
    },
  };
  pool = mysql.createPool(config);
} else {
  // Fallback to individual environment variables for development
  const isDev = process.env.NODE_ENV === "development";
  
  const productionConfig: PoolOptions = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
  };

  const developmentConfig: PoolOptions = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    database: process.env.DATABASE_NAME,
  };

  pool = mysql.createPool(isDev ? developmentConfig : productionConfig);
}

export const db = drizzle(pool, { schema, mode: "default" });

export * from "./schema";
export * from "./id";
