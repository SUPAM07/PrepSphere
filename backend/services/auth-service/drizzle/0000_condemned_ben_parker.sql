CREATE TYPE "public"."account_status" AS ENUM('ACTIVE', 'DISABLED', 'LOCKED');--> statement-breakpoint
CREATE TABLE "processed_events" (
	"payment_id" varchar(255) PRIMARY KEY NOT NULL,
	"processed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"device" varchar(255),
	"browser" varchar(255),
	"os" varchar(255),
	"ip" varchar(45),
	"country" varchar(100),
	"refresh_token_hash" varchar(512),
	"last_seen" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"name" varchar(255),
	"is_verified" boolean DEFAULT false NOT NULL,
	"account_status" "account_status" DEFAULT 'ACTIVE' NOT NULL,
	"verification_otp" varchar(10),
	"otp_expires_at" timestamp,
	"interview_coin" integer DEFAULT 150 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;