CREATE TYPE "status" AS ENUM('accepted', 'pending', 'rejected', 'blocked');--> statement-breakpoint
CREATE TABLE "friends" (
	"sent_by" text,
	"received_by" text,
	"friend_status" "status" NOT NULL,
	"request_accepted_at" timestamp,
	"request_sent_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "friends_pkey" PRIMARY KEY("sent_by","received_by"),
	CONSTRAINT "banned_check" CHECK ((("friend_status" = "accepted" OR "friend_status" = "blocked") AND "request_accepted_at" IS NOT NULL) OR "friend_status" = "pending" OR "friend_status" = "rejected")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"username" text PRIMARY KEY,
	"photo" text,
	"description" text,
	"settings" json NOT NULL,
	"user_id" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_sent_by_profiles_username_fkey" FOREIGN KEY ("sent_by") REFERENCES "profiles"("username");--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_received_by_profiles_username_fkey" FOREIGN KEY ("received_by") REFERENCES "profiles"("username");--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_username_users_name_fkey" FOREIGN KEY ("username") REFERENCES "users"("name");--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_photo_users_image_fkey" FOREIGN KEY ("photo") REFERENCES "users"("image");--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");