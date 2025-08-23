import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';

export const DATABASE = 'DATABASE';

@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: () =>
        drizzle({
          connection: {
            host: process.env['DATABASE_HOST'],
            port: parseInt(process.env['DATABASE_PORT'] || ''),
            user: process.env['DATABASE_USER'],
            password: process.env['DATABASE_PASSWORD'],
            database: process.env['DATABASE_NAME'],
            ssl: {
              ca: process.env['DATABASE_CA'],
            },
          },
        }),
    },
  ],
  exports: [DATABASE],
})
export class DbModule {}
