import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkoutController } from './controllers/workout.controller';
import { WorkoutService } from './services/workout.service';
import { DbModule } from '@strength-tracker/db';

@Module({
  imports: [DbModule],
  controllers: [AppController, WorkoutController],
  providers: [AppService, WorkoutService],
})
export class AppModule {}
