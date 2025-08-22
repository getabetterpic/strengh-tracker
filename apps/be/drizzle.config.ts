import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './apps/be/db',
  schema: './libs/db/src/lib/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
      ca: process.env.CA_CERT,
    },
  },
});
