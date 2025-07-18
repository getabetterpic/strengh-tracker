import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
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

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    resourceId: varchar('resource_id')
      .notNull()
      .unique()
      .$defaultFn(() => ksuid.randomSync().string),
    email: varchar().notNull().unique(),
    passwordDigest: varchar('password_digest'),
    phoneNumber: varchar('phone_number'),
    name: varchar(),
    otpSecret: varchar('otp_secret'),
    preferences: jsonb().$defaultFn(() => []),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex('users_on_resource_id_idx').on(table.resourceId),
    uniqueIndex('users_on_email_idx').on(table.email),
    index('users_on_phone_number_idx').on(table.phoneNumber),
  ]
);

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
    userId: integer('user_id'),
  },
  (table) => [uniqueIndex('resource_id_idx').on(table.resourceId)]
);

export const workoutRelations = relations(workouts, ({ one, many }) => ({
  exercises: many(exercises),
  user: one(users),
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
