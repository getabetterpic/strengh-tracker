import { Injectable } from '@nestjs/common';
import { Workout, Exercise, Set } from '@strength-tracker/util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WorkoutService {
  private workouts: Workout[] = [];

  getAllWorkouts(): Workout[] {
    return this.workouts;
  }

  getWorkoutById(id: string): Workout | null | undefined {
    return this.workouts.find(workout => workout.id === id);
  }

  createWorkout(workoutData: Omit<Workout, 'id'>): Workout {
    const newWorkout: Workout = {
      ...workoutData,
      id: uuidv4(),
    };
    this.workouts.push(newWorkout);
    return newWorkout;
  }

  updateWorkout(id: string, workoutData: Partial<Workout>): Workout | null {
    const workoutIndex = this.workouts.findIndex(workout => workout.id === id);
    if (workoutIndex === -1) {
      return null;
    }

    this.workouts[workoutIndex] = {
      ...this.workouts[workoutIndex],
      ...workoutData,
    };

    return this.workouts[workoutIndex];
  }

  deleteWorkout(id: string): boolean {
    const initialLength = this.workouts.length;
    this.workouts = this.workouts.filter(workout => workout.id !== id);
    return initialLength !== this.workouts.length;
  }

  // Exercise operations
  addExerciseToWorkout(workoutId: string, exerciseData: Omit<Exercise, 'id'>): Workout | null {
    const workout = this.getWorkoutById(workoutId);
    if (!workout) {
      return null;
    }

    const newExercise: Exercise = {
      ...exerciseData,
      id: uuidv4(),
    };

    workout.exercises.push(newExercise);
    return workout;
  }

  updateExercise(workoutId: string, exerciseId: string, exerciseData: Partial<Exercise>): Workout | null {
    const workout = this.getWorkoutById(workoutId);
    if (!workout) {
      return null;
    }

    const exerciseIndex = workout.exercises.findIndex(exercise => exercise.id === exerciseId);
    if (exerciseIndex === -1) {
      return null;
    }

    workout.exercises[exerciseIndex] = {
      ...workout.exercises[exerciseIndex],
      ...exerciseData,
    };

    return workout;
  }

  deleteExercise(workoutId: string, exerciseId: string): Workout | null {
    const workout = this.getWorkoutById(workoutId);
    if (!workout) {
      return null;
    }

    workout.exercises = workout.exercises.filter(exercise => exercise.id !== exerciseId);
    return workout;
  }

  // Set operations
  addSetToExercise(workoutId: string, exerciseId: string, setData: Set): Workout | null {
    const workout = this.getWorkoutById(workoutId);
    if (!workout) {
      return null;
    }

    const exercise = workout.exercises.find(exercise => exercise.id === exerciseId);
    if (!exercise) {
      return null;
    }

    exercise.sets.push(setData);
    return workout;
  }

  updateSet(workoutId: string, exerciseId: string, setIndex: number, setData: Partial<Set>): Workout | null {
    const workout = this.getWorkoutById(workoutId);
    if (!workout) {
      return null;
    }

    const exercise = workout.exercises.find(exercise => exercise.id === exerciseId);
    if (!exercise || setIndex < 0 || setIndex >= exercise.sets.length) {
      return null;
    }

    exercise.sets[setIndex] = {
      ...exercise.sets[setIndex],
      ...setData,
    };

    return workout;
  }

  deleteSet(workoutId: string, exerciseId: string, setIndex: number): Workout | null {
    const workout = this.getWorkoutById(workoutId);
    if (!workout) {
      return null;
    }

    const exercise = workout.exercises.find(exercise => exercise.id === exerciseId);
    if (!exercise || setIndex < 0 || setIndex >= exercise.sets.length) {
      return null;
    }

    exercise.sets.splice(setIndex, 1);
    return workout;
  }
}
