import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { WorkoutService } from '../services/workout.service';
import { Workout, Exercise, Set } from '../models/workout.model';

@Controller('api/workouts')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Get()
  getAllWorkouts(): Workout[] {
    return this.workoutService.getAllWorkouts();
  }

  @Get(':id')
  getWorkoutById(@Param('id') id: string): Workout {
    const workout = this.workoutService.getWorkoutById(id);
    if (!workout) {
      throw new HttpException('Workout not found', HttpStatus.NOT_FOUND);
    }
    return workout;
  }

  @Post()
  createWorkout(@Body() workoutData: Omit<Workout, 'id'>): Workout {
    return this.workoutService.createWorkout(workoutData);
  }

  @Put(':id')
  updateWorkout(@Param('id') id: string, @Body() workoutData: Partial<Workout>): Workout {
    const updatedWorkout = this.workoutService.updateWorkout(id, workoutData);
    if (!updatedWorkout) {
      throw new HttpException('Workout not found', HttpStatus.NOT_FOUND);
    }
    return updatedWorkout;
  }

  @Delete(':id')
  deleteWorkout(@Param('id') id: string): { success: boolean } {
    const success = this.workoutService.deleteWorkout(id);
    if (!success) {
      throw new HttpException('Workout not found', HttpStatus.NOT_FOUND);
    }
    return { success };
  }

  // Exercise endpoints
  @Post(':workoutId/exercises')
  addExerciseToWorkout(
    @Param('workoutId') workoutId: string,
    @Body() exerciseData: Omit<Exercise, 'id'>
  ): Workout {
    const workout = this.workoutService.addExerciseToWorkout(workoutId, exerciseData);
    if (!workout) {
      throw new HttpException('Workout not found', HttpStatus.NOT_FOUND);
    }
    return workout;
  }

  @Put(':workoutId/exercises/:exerciseId')
  updateExercise(
    @Param('workoutId') workoutId: string,
    @Param('exerciseId') exerciseId: string,
    @Body() exerciseData: Partial<Exercise>
  ): Workout {
    const workout = this.workoutService.updateExercise(workoutId, exerciseId, exerciseData);
    if (!workout) {
      throw new HttpException('Workout or exercise not found', HttpStatus.NOT_FOUND);
    }
    return workout;
  }

  @Delete(':workoutId/exercises/:exerciseId')
  deleteExercise(
    @Param('workoutId') workoutId: string,
    @Param('exerciseId') exerciseId: string
  ): Workout {
    const workout = this.workoutService.deleteExercise(workoutId, exerciseId);
    if (!workout) {
      throw new HttpException('Workout or exercise not found', HttpStatus.NOT_FOUND);
    }
    return workout;
  }

  // Set endpoints
  @Post(':workoutId/exercises/:exerciseId/sets')
  addSetToExercise(
    @Param('workoutId') workoutId: string,
    @Param('exerciseId') exerciseId: string,
    @Body() setData: Set
  ): Workout {
    const workout = this.workoutService.addSetToExercise(workoutId, exerciseId, setData);
    if (!workout) {
      throw new HttpException('Workout or exercise not found', HttpStatus.NOT_FOUND);
    }
    return workout;
  }

  @Put(':workoutId/exercises/:exerciseId/sets/:setIndex')
  updateSet(
    @Param('workoutId') workoutId: string,
    @Param('exerciseId') exerciseId: string,
    @Param('setIndex') setIndex: string,
    @Body() setData: Partial<Set>
  ): Workout {
    const workout = this.workoutService.updateSet(
      workoutId,
      exerciseId,
      parseInt(setIndex, 10),
      setData
    );
    if (!workout) {
      throw new HttpException('Workout, exercise, or set not found', HttpStatus.NOT_FOUND);
    }
    return workout;
  }

  @Delete(':workoutId/exercises/:exerciseId/sets/:setIndex')
  deleteSet(
    @Param('workoutId') workoutId: string,
    @Param('exerciseId') exerciseId: string,
    @Param('setIndex') setIndex: string
  ): Workout {
    const workout = this.workoutService.deleteSet(
      workoutId,
      exerciseId,
      parseInt(setIndex, 10)
    );
    if (!workout) {
      throw new HttpException('Workout, exercise, or set not found', HttpStatus.NOT_FOUND);
    }
    return workout;
  }
}
