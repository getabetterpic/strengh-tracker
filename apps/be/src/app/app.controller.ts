import {
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE } from '@strength-tracker/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Public } from './auth/public';

@Controller()
export class AppController {
  constructor(@Inject(DATABASE) private readonly db: NodePgDatabase) {}

  @Public()
  @Get('health-check')
  async healthCheck() {
    try {
      return { postgres: false };
    } catch (e) {
      const error =
        process.env.NODE_ENV === 'production'
          ? 'The database could not connect.'
          : e.message;
      throw new InternalServerErrorException({
        postgres: false,
        error,
      });
    }
  }
}
