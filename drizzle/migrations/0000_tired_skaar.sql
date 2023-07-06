CREATE TABLE IF NOT EXISTS "imageGen"."generatedImage" (
	"id" serial PRIMARY KEY NOT NULL,
	"userAccountId" integer,
	"prompt" text NOT NULL,
	"key" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "imageGen"."userAccount" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"imageGenerationTokens" integer DEFAULT 0 NOT NULL,
	"isUnlimited" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "userIdIndex" ON "imageGen"."userAccount" ("userId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "imageGen"."generatedImage" ADD CONSTRAINT "generatedImage_userAccountId_userAccount_id_fk" FOREIGN KEY ("userAccountId") REFERENCES "imageGen"."userAccount"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
