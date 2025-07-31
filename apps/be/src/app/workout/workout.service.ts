import { Inject, Injectable } from '@nestjs/common';
import { Workout, Exercise, Set } from '@strength-tracker/util';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE, workouts, exercises, users } from '@strength-tracker/db';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class WorkoutService {
  private workouts: Workout[] = [];

  constructor(@Inject(DATABASE) private db: NodePgDatabase) {}

  async getAllWorkouts(userId: string) {
    const rows = await this.db
      .select({
        workout: workouts,
        exercise: exercises,
      })
      .from(workouts)
      .innerJoin(users, eq(workouts.userId, users.id))
      .leftJoin(exercises, eq(workouts.id, exercises.workoutId))
      .where(eq(users.resourceId, userId));
    return this.combineWorkoutsAndExercises(rows);
  }

  async getWorkoutById(id: string, userId: string) {
    const rows = await this.db
      .select({
        workout: workouts,
        exercise: exercises,
      })
      .from(workouts)
      .innerJoin(users, eq(workouts.userId, users.id))
      .leftJoin(exercises, eq(workouts.id, exercises.workoutId))
      .where(
        and(eq(workouts.id, parseInt(id, 10)), eq(users.resourceId, userId))
      );
    return this.combineWorkoutsAndExercises(rows);
  }

  async createWorkout(workoutData: Omit<Workout, 'id'>) {
    return this.db.insert(workouts).values(workoutData).returning({
      resourceId: workouts.resourceId,
    });
  }

  async updateWorkout(workoutId: string, workoutData: Partial<Workout>) {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      id: _,
      exercises: workoutExercises,
      ...remainingData
    } = workoutData;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const toInsert = (workoutExercises ?? []).map(({ id, ...exercise }) => ({
      ...exercise,
      workoutId: parseInt(workoutId),
    }));

    return this.db.transaction(async (tx) => {
      if (toInsert.length) {
        await tx
          .delete(exercises)
          .where(eq(exercises.workoutId, parseInt(workoutId)));
        await tx.insert(exercises).values(toInsert);
      }

      return tx
        .update(workouts)
        .set(remainingData)
        .where(eq(workouts.id, parseInt(workoutId)))
        .returning({
          resourceId: workouts.resourceId,
        });
    });
  }

  async deleteWorkout(id: string) {
    return this.db
      .delete(workouts)
      .where(eq(workouts.id, parseInt(id)))
      .returning({ resourceId: workouts.resourceId });
  }

  // Exercise operations
  async addExerciseToWorkout(
    workoutId: string,
    exerciseData: Omit<Exercise, 'id'>
  ) {
    return this.db
      .insert(exercises)
      .values({ ...exerciseData, workoutId: parseInt(workoutId) })
      .returning({ resourceId: exercises.resourceId });
  }

  async updateExercise(
    workoutId: string,
    exerciseId: string,
    exerciseData: Omit<Partial<Exercise>, 'id' | 'workoutId'>
  ) {
    return this.db
      .update(exercises)
      .set(exerciseData)
      .where(eq(exercises.id, parseInt(exerciseId, 10)))
      .returning({ resourceId: exercises.resourceId });
  }

  async deleteExercise(workoutId: string, exerciseId: string) {
    return this.db
      .delete(exercises)
      .where(eq(exercises.id, parseInt(exerciseId)))
      .returning({ resourceId: exercises.resourceId });
  }

  // Set operations
  async addSetToExercise(workoutId: string, exerciseId: string, setData: Set) {
    const [exercise] = await this.db
      .select({ sets: exercises.sets })
      .from(exercises)
      .where(eq(exercises.id, parseInt(exerciseId)));
    if (!exercise?.sets) {
      return null;
    }

    exercise.sets.push(setData);
    return this.db
      .update(exercises)
      .set(exercise)
      .where(eq(exercises.id, parseInt(exerciseId)))
      .returning({ resourceId: exercises.resourceId });
  }

  async updateSet(
    workoutId: string,
    exerciseId: string,
    setIndex: number,
    setData: Partial<Set>
  ) {
    const [exercise] = await this.db
      .select({ sets: exercises.sets })
      .from(exercises)
      .where(eq(exercises.id, parseInt(exerciseId)));
    if (!exercise?.sets || setIndex < 0 || setIndex >= exercise.sets.length) {
      return null;
    }

    exercise.sets[setIndex] = {
      ...exercise.sets[setIndex],
      ...setData,
    };

    return this.db
      .update(exercises)
      .set(exercise)
      .where(eq(exercises.id, parseInt(exerciseId)))
      .returning({ resourceId: exercises.resourceId });
  }

  async deleteSet(workoutId: string, exerciseId: string, setIndex: number) {
    const [exercise] = await this.db
      .select({ sets: exercises.sets })
      .from(exercises)
      .where(eq(exercises.id, parseInt(exerciseId)));
    if (!exercise?.sets || setIndex < 0 || setIndex >= exercise.sets.length) {
      return null;
    }

    exercise.sets.splice(setIndex, 1);
    return this.db
      .update(exercises)
      .set(exercise)
      .where(eq(exercises.id, parseInt(exerciseId)))
      .returning({ resourceId: exercises.resourceId });
  }

  private combineWorkoutsAndExercises(rows: { workout: any; exercise: any }[]) {
    const allWorkouts = rows.reduce<Record<number, any>>((acc, row) => {
      const { workout, exercise } = row;

      if (!acc[workout.id]) {
        acc[workout.id] = { ...workout, exercises: [] };
      }

      if (exercise) {
        acc[workout.id].exercises.push(exercise);
      }

      return acc;
    }, {});
    return Object.values(allWorkouts);
  }
}
