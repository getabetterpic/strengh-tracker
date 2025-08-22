import { defineConfig } from 'drizzle-kit';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';

export default defineConfig({
  out: './apps/be/db',
  schema: './libs/db/src/lib/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: {
      ca: process.env.DATABASE_CA,
    },
  },
});
