CREATE TABLE "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"resource_id" varchar NOT NULL,
	"workout_id" integer,
	"name" varchar NOT NULL,
	"sets" jsonb,
	CONSTRAINT "exercises_resource_id_unique" UNIQUE("resource_id")
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"resource_id" varchar NOT NULL,
	"date" date NOT NULL,
	"name" varchar NOT NULL,
	"notes" text,
	"completed_at" date,
	CONSTRAINT "workouts_resource_id_unique" UNIQUE("resource_id")
);
--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "resource_id_idx" ON "workouts" USING btree ("resource_id");