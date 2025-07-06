import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';

export const DATABASE = 'DATABASE';

@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: () => drizzle(process.env['DATABASE_URL'] as string),
    },
  ],
  exports: [DATABASE],
})
export class DbModule {}
