import { drizzle } from "drizzle-orm/mysql2";
import mysql, { type PoolOptions } from "mysql2/promise";

import * as schema from "./schema";

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

const isDev = process.env.NODE_ENV === "development";

const pool = mysql.createPool(isDev ? developmentConfig : productionConfig);

export const db = drizzle(pool, { schema, mode: "default" });

export * from "./schema";
export * from "./id";
