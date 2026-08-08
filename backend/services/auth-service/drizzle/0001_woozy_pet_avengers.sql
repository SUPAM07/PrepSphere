CREATE TYPE "public"."auth_provider" AS ENUM('google', 'github');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "verification_otp" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provider" "auth_provider";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provider_id" varchar(255);--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "interview_coin";