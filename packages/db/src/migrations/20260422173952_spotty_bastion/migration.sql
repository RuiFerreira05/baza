CREATE TABLE "profiles" (
	"username" text PRIMARY KEY,
	"photo" text,
	"description" text,
	"settings" json NOT NULL,
	"accountId" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_username_users_name_fkey" FOREIGN KEY ("username") REFERENCES "users"("name");--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_photo_users_image_fkey" FOREIGN KEY ("photo") REFERENCES "users"("image");