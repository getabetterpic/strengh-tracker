import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DbModule } from '@strength-tracker/db';
import { AuthModule } from '../auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../auth/auth.guard';

@Module({
  imports: [DbModule, AuthModule],
  providers: [UsersService, { provide: APP_GUARD, useClass: AuthGuard }],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
