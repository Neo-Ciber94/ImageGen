CREATE TABLE IF NOT EXISTS "generatedImage" (
	"id" serial PRIMARY KEY NOT NULL,
	"userAccountId" integer,
	"prompt" text NOT NULL,
	"key" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userAccount" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"imageGenerationTokens" integer DEFAULT 0 NOT NULL,
	"isUnlimited" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "userIdIndex" ON "userAccount" ("userId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generatedImage" ADD CONSTRAINT "generatedImage_userAccountId_userAccount_id_fk" FOREIGN KEY ("userAccountId") REFERENCES "userAccount"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
