import { Module } from '@nestjs/common';
import { WorkoutController } from './workout.controller';
import { WorkoutService } from './workout.service';
import { DbModule } from '@strength-tracker/db';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../auth/auth.guard';

@Module({
  imports: [DbModule],
  controllers: [WorkoutController],
  providers: [WorkoutService, { provide: APP_GUARD, useClass: AuthGuard }],
  exports: [WorkoutService],
})
export class WorkoutModule {}
