CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"resource_id" varchar NOT NULL,
	"email" varchar NOT NULL,
	"password_digest" varchar,
	"phone_number" varchar,
	"name" varchar,
	"otp_secret" varchar,
	"preferences" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_resource_id_unique" UNIQUE("resource_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "user_id" integer;--> statement-breakpoint
CREATE UNIQUE INDEX "users_on_resource_id_idx" ON "users" USING btree ("resource_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_on_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_on_phone_number_idx" ON "users" USING btree ("phone_number");