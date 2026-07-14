ALTER TABLE "weekly_editions" ADD COLUMN "publication_mode" text DEFAULT 'PREVIEW' NOT NULL;--> statement-breakpoint
ALTER TABLE "weekly_editions" ADD COLUMN "is_active" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "weekly_editions" ADD COLUMN "activated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "weekly_editions" ADD COLUMN "deactivated_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "weekly_editions_single_active_uidx" ON "weekly_editions" USING btree ("is_active") WHERE "weekly_editions"."is_active" = true;