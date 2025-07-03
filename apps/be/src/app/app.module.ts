import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkoutController } from './controllers/workout.controller';
import { WorkoutService } from './services/workout.service';

@Module({
  imports: [],
  controllers: [AppController, WorkoutController],
  providers: [AppService, WorkoutService],
})
export class AppModule {}
