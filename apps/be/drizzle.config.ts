import { defineConfig } from 'drizzle-kit';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';

export default defineConfig({
  out: './apps/be/db',
  schema: './libs/db/src/lib/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
    ssl: {
      ca: readFileSync(
        path.join(__dirname, 'db-ca-certificate.crt')
      ).toString(),
    },
  },
});
