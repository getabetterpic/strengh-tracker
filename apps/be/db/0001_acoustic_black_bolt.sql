ALTER TABLE "exercises" DROP CONSTRAINT "exercises_workout_id_workouts_id_fk";
--> statement-breakpoint
ALTER TABLE "exercises" ALTER COLUMN "workout_id" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "exercises_on_resource_id_idx" ON "exercises" USING btree ("resource_id");