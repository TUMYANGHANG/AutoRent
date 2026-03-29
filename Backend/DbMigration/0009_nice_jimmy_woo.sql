ALTER TABLE "chat_messages" ALTER COLUMN "text" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD COLUMN "attachment_url" varchar(1024);