ALTER TABLE "event_confirmations" ADD COLUMN "event_id" uuid;--> statement-breakpoint
ALTER TABLE "event_confirmations" DROP CONSTRAINT "event_confirmations_pkey";--> statement-breakpoint
ALTER TABLE "event_confirmations" ADD PRIMARY KEY ("event_id","username");--> statement-breakpoint
ALTER TABLE "event_confirmations" ALTER COLUMN "confirmed_at" SET DATA TYPE timestamp USING "confirmed_at"::timestamp;--> statement-breakpoint
ALTER TABLE "event_confirmations" ADD CONSTRAINT "event_confirmations_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;