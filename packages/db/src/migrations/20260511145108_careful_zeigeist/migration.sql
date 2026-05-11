CREATE TYPE "status" AS ENUM('accepted', 'pending', 'rejected', 'blocked');--> statement-breakpoint
CREATE TYPE "every" AS ENUM('day', 'week', 'month', 'year', 'never');--> statement-breakpoint
CREATE TYPE "state" AS ENUM('finished', 'unfinished');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friends" (
	"sent_by" text,
	"received_by" text,
	"friend_status" "status" NOT NULL,
	"request_accepted_at" timestamp,
	"request_sent_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "friends_pkey" PRIMARY KEY("sent_by","received_by"),
	CONSTRAINT "banned_check" CHECK ((("friend_status" = 'accepted' OR "friend_status" = 'blocked') AND "request_accepted_at" IS NOT NULL) OR "friend_status" = 'pending' OR "friend_status" = 'rejected')
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"username" text PRIMARY KEY,
	"photo" text,
	"description" text,
	"settings" json NOT NULL,
	"user_id" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_members" (
	"username" text,
	"group_id" text,
	"admin" boolean NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"banned_at" timestamp,
	"accepted_invite" boolean NOT NULL,
	"accepted_at" timestamp,
	"invited_at" timestamp NOT NULL,
	CONSTRAINT "group_members_pkey" PRIMARY KEY("username","group_id"),
	CONSTRAINT "banned_check" CHECK (("banned" AND "banned_at" IS NOT NULL) OR NOT "banned"),
	CONSTRAINT "invite_check" CHECK (("accepted_invite" AND "accepted_at" IS NOT NULL) OR NOT "accepted_invite")
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" text PRIMARY KEY,
	"group_name" varchar(64) NOT NULL,
	"description" text,
	"photo" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "group_name_check" CHECK ("group_name" ~ '^[A-Za-z0-9_\-\.]{3,}$')
);
--> statement-breakpoint
CREATE TABLE "event_confirmations" (
	"group_id" text,
	"username" text,
	"confirmed_at" text NOT NULL,
	CONSTRAINT "event_confirmations_pkey" PRIMARY KEY("group_id","username")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY,
	"title" varchar(64) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_events" (
	"id" text PRIMARY KEY,
	"group_id" text,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"state" "state" NOT NULL,
	"voting_end_time" timestamp,
	"createdBy" text NOT NULL,
	CONSTRAINT "voting_time_check" CHECK ((("voting_end_time" > CURRENT_TIMESTAMP) AND "state" = 'unfinished') OR 
         (("voting_end_time" < CURRENT_TIMESTAMP) AND "state" = 'finished'))
);
--> statement-breakpoint
CREATE TABLE "group_events_final" (
	"id" text PRIMARY KEY,
	"group_id" text,
	"plan_id" text
);
--> statement-breakpoint
CREATE TABLE "personal_events" (
	"id" text,
	"username" text,
	"date" date NOT NULL,
	"location" text,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"repeat" "every" NOT NULL,
	"public" boolean NOT NULL,
	CONSTRAINT "personal_events_pkey" PRIMARY KEY("id","username"),
	CONSTRAINT "time_check" CHECK ("start_time" < "end_time")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" text PRIMARY KEY,
	"group_event_id" text,
	"username" text,
	"title" varchar(64) NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"activity" text,
	"location" text NOT NULL,
	"min_budget" integer,
	"max_budget" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "time_check" CHECK ("start_time" < "end_time"),
	CONSTRAINT "budget_check" CHECK ("min_budget" < "max_budget")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"plan_id" text,
	"username" text,
	CONSTRAINT "votes_pkey" PRIMARY KEY("plan_id","username")
);
--> statement-breakpoint
CREATE TABLE "preferences" (
	"group_event_id" text,
	"username" text,
	"preference" json NOT NULL,
	"private" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "preferences_pkey" PRIMARY KEY("username","group_event_id")
);
--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" ("identifier");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_sent_by_profiles_username_fkey" FOREIGN KEY ("sent_by") REFERENCES "profiles"("username");--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_received_by_profiles_username_fkey" FOREIGN KEY ("received_by") REFERENCES "profiles"("username");--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_username_profiles_username_fkey" FOREIGN KEY ("username") REFERENCES "profiles"("username");--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id");--> statement-breakpoint
ALTER TABLE "event_confirmations" ADD CONSTRAINT "event_confirmations_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id");--> statement-breakpoint
ALTER TABLE "event_confirmations" ADD CONSTRAINT "event_confirmations_username_profiles_username_fkey" FOREIGN KEY ("username") REFERENCES "profiles"("username");--> statement-breakpoint
ALTER TABLE "group_events" ADD CONSTRAINT "group_events_id_events_id_fkey" FOREIGN KEY ("id") REFERENCES "events"("id");--> statement-breakpoint
ALTER TABLE "group_events" ADD CONSTRAINT "group_events_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id");--> statement-breakpoint
ALTER TABLE "group_events" ADD CONSTRAINT "group_events_createdBy_profiles_username_fkey" FOREIGN KEY ("createdBy") REFERENCES "profiles"("username");--> statement-breakpoint
ALTER TABLE "group_events_final" ADD CONSTRAINT "group_events_final_id_events_id_fkey" FOREIGN KEY ("id") REFERENCES "events"("id");--> statement-breakpoint
ALTER TABLE "group_events_final" ADD CONSTRAINT "group_events_final_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id");--> statement-breakpoint
ALTER TABLE "group_events_final" ADD CONSTRAINT "group_events_final_plan_id_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id");--> statement-breakpoint
ALTER TABLE "personal_events" ADD CONSTRAINT "personal_events_id_events_id_fkey" FOREIGN KEY ("id") REFERENCES "events"("id");--> statement-breakpoint
ALTER TABLE "personal_events" ADD CONSTRAINT "personal_events_username_profiles_username_fkey" FOREIGN KEY ("username") REFERENCES "profiles"("username");--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_group_event_id_group_events_id_fkey" FOREIGN KEY ("group_event_id") REFERENCES "group_events"("id");--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_username_profiles_username_fkey" FOREIGN KEY ("username") REFERENCES "profiles"("username");--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_plan_id_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id");--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_username_profiles_username_fkey" FOREIGN KEY ("username") REFERENCES "profiles"("username");--> statement-breakpoint
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_group_event_id_group_events_id_fkey" FOREIGN KEY ("group_event_id") REFERENCES "group_events"("id");--> statement-breakpoint
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_username_profiles_username_fkey" FOREIGN KEY ("username") REFERENCES "profiles"("username");