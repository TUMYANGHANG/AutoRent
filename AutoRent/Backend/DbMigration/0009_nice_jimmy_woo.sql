ALTER TABLE "chat_messages" ALTER COLUMN "text" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD COLUMN "attachment_url" varchar(1024);
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;