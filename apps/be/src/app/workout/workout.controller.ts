import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  Request,
} from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { Workout, Exercise, Set } from '@strength-tracker/util';
import { Request as ExpRequest } from 'express';

@Controller('workouts')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Get()
  async getAllWorkouts(@Request() req: ExpRequest) {
    return this.workoutService.getAllWorkouts(req.user.sub);
  }

  @Get(':id')
  async getWorkoutById(@Param('id') id: string, @Request() req: ExpRequest) {
    const [workout] = await this.workoutService.getWorkoutById(
      id,
      req.user.sub
    );
    if (!workout) {
      throw new NotFoundException();
    }
    return workout;
  }

  @Post()
  async createWorkout(
    @Body() workoutData: Omit<Workout, 'id'>,
    @Request() req: ExpRequest
  ) {
    return this.workoutService.createWorkout(workoutData, req.user.sub);
  }

  @Put(':id')
  async updateWorkout(
    @Param('id') id: string,
    @Body() workoutData: Partial<Workout>
  ) {
    const updatedWorkout = await this.workoutService.updateWorkout(
      id,
      workoutData
    );
    if (!updatedWorkout) {
      throw new NotFoundException();
    }
    return updatedWorkout;
  }

  @Delete(':id')
  async deleteWorkout(@Param('id') id: string) {
    const success = await this.workoutService.deleteWorkout(id);
    if (!success) {
      throw new NotFoundException();
    }
    return { success };
  }

  // Exercise endpoints
  @Post(':workoutId/exercises')
  async addExerciseToWorkout(
    @Param('workoutId') workoutId: string,
    @Body() exerciseData: Omit<Exercise, 'id'>
  ) {
    const workout = await this.workoutService.addExerciseToWorkout(
      workoutId,
      exerciseData
    );
    if (!workout) {
      throw new NotFoundException();
    }
    return workout;
  }

  @Put(':workoutId/exercises/:exerciseId')
  async updateExercise(
    @Param('workoutId') workoutId: string,
    @Param('exerciseId') exerciseId: string,
    @Body() exerciseData: Partial<Exercise>
  ) {
    const workout = await this.workoutService.updateExercise(
      workoutId,
      exerciseId,
      exerciseData
    );
    if (!workout) {
      throw new NotFoundException();
    }
    return workout;
  }

  @Delete(':workoutId/exercises/:exerciseId')
  async deleteExercise(
    @Param('workoutId') workoutId: string,
    @Param('exerciseId') exerciseId: string
  ) {
    const workout = await this.workoutService.deleteExercise(
      workoutId,
      exerciseId
    );
    if (!workout) {
      throw new NotFoundException();
    }
    return workout;
  }

  // Set endpoints
  @Post(':workoutId/exercises/:exerciseId/sets')
  async addSetToExercise(
    @Param('workoutId') workoutId: string,
    @Param('exerciseId') exerciseId: string,
    @Body() setData: Set
  ) {
    const workout = await this.workoutService.addSetToExercise(
      workoutId,
      exerciseId,
      setData
    );
    if (!workout) {
      throw new NotFoundException();
    }
    return workout;
  }

  @Put(':workoutId/exercises/:exerciseId/sets/:setIndex')
  async updateSet(
    @Param('workoutId') workoutId: string,
    @Param('exerciseId') exerciseId: string,
    @Param('setIndex') setIndex: string,
    @Body() setData: Partial<Set>
  ) {
    const workout = this.workoutService.updateSet(
      workoutId,
      exerciseId,
      parseInt(setIndex, 10),
      setData
    );
    if (!workout) {
      throw new NotFoundException();
    }
    return workout;
  }

  @Delete(':workoutId/exercises/:exerciseId/sets/:setIndex')
  async deleteSet(
    @Param('workoutId') workoutId: string,
    @Param('exerciseId') exerciseId: string,
    @Param('setIndex') setIndex: string
  ) {
    const workout = await this.workoutService.deleteSet(
      workoutId,
      exerciseId,
      parseInt(setIndex, 10)
    );
    if (!workout) {
      throw new NotFoundException();
    }
    return workout;
  }
}
