import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import ksuid from 'ksuid';
import { relations } from 'drizzle-orm';

interface Set {
  reps: number;
  weight: number;
  completed: boolean;
}

export const workouts = pgTable(
  'workouts',
  {
    id: serial('id').primaryKey(),
    resourceId: varchar('resource_id')
      .notNull()
      .unique()
      .$defaultFn(() => ksuid.randomSync().string),
    date: date('date').notNull(),
    name: varchar('name').notNull(),
    notes: text('notes'),
    completedAt: date('completed_at'),
  },
  (table) => [uniqueIndex('resource_id_idx').on(table.resourceId)]
);

export const workoutRelations = relations(workouts, ({ many }) => ({
  exercises: many(exercises),
}));

export const exercises = pgTable(
  'exercises',
  {
    id: serial('id').primaryKey(),
    resourceId: varchar('resource_id')
      .notNull()
      .unique()
      .$defaultFn(() => ksuid.randomSync().string),
    name: varchar('name').notNull(),
    workoutId: integer('workout_id').notNull(),
    sets: jsonb('sets')
      .$defaultFn(() => [])
      .$type<Set[]>(),
  },
  (table) => [
    uniqueIndex('exercises_on_resource_id_idx').on(table.resourceId),
    index('exercises_on_workout_id_idx').on(table.workoutId),
  ]
);

export const exerciseRelations = relations(exercises, ({ one }) => ({
  workout: one(workouts, {
    fields: [exercises.workoutId],
    references: [workouts.id],
  }),
}));

export type SelectWorkout = typeof workouts.$inferSelect;
