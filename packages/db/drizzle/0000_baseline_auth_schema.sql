-- Baseline for brand-new databases. Creates the Better Auth tables in their
-- current shape. Runs only when there is no "user" table (an empty database):
-- legacy databases skip it and are upgraded by 0000_migrate_apikey_reference_id;
-- databases that already applied 0000 never see it because this entry is
-- dated earlier in the journal.
DO $$
BEGIN
  IF to_regclass('public.user') IS NULL THEN
    CREATE TABLE "account" (
    	"id" text PRIMARY KEY NOT NULL,
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

    CREATE TABLE "apikey" (
    	"id" text PRIMARY KEY NOT NULL,
    	"config_id" text DEFAULT 'default' NOT NULL,
    	"name" text,
    	"start" text,
    	"reference_id" text NOT NULL,
    	"prefix" text,
    	"key" text NOT NULL,
    	"refill_interval" integer,
    	"refill_amount" integer,
    	"last_refill_at" timestamp,
    	"enabled" boolean DEFAULT true,
    	"rate_limit_enabled" boolean DEFAULT true,
    	"rate_limit_time_window" integer DEFAULT 60000,
    	"rate_limit_max" integer DEFAULT 100,
    	"request_count" integer DEFAULT 0,
    	"remaining" integer,
    	"last_request" timestamp,
    	"expires_at" timestamp,
    	"created_at" timestamp DEFAULT now() NOT NULL,
    	"updated_at" timestamp DEFAULT now() NOT NULL,
    	"permissions" text,
    	"metadata" text
    );

    CREATE TABLE "session" (
    	"id" text PRIMARY KEY NOT NULL,
    	"expires_at" timestamp NOT NULL,
    	"token" text NOT NULL,
    	"created_at" timestamp DEFAULT now() NOT NULL,
    	"updated_at" timestamp NOT NULL,
    	"ip_address" text,
    	"user_agent" text,
    	"user_id" text NOT NULL,
    	CONSTRAINT "session_token_unique" UNIQUE("token")
    );

    CREATE TABLE "user" (
    	"id" text PRIMARY KEY NOT NULL,
    	"name" text NOT NULL,
    	"email" text NOT NULL,
    	"email_verified" boolean DEFAULT false NOT NULL,
    	"image" text,
    	"created_at" timestamp DEFAULT now() NOT NULL,
    	"updated_at" timestamp DEFAULT now() NOT NULL,
    	"username" text,
    	"github_username" text,
    	"github_profile_url" text,
    	CONSTRAINT "user_email_unique" UNIQUE("email"),
    	CONSTRAINT "user_username_unique" UNIQUE("username")
    );

    CREATE TABLE "verification" (
    	"id" text PRIMARY KEY NOT NULL,
    	"identifier" text NOT NULL,
    	"value" text NOT NULL,
    	"expires_at" timestamp NOT NULL,
    	"created_at" timestamp DEFAULT now() NOT NULL,
    	"updated_at" timestamp DEFAULT now() NOT NULL
    );

    ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "apikey" ADD CONSTRAINT "apikey_reference_id_user_id_fk" FOREIGN KEY ("reference_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");
    CREATE INDEX "apikey_configId_idx" ON "apikey" USING btree ("config_id");
    CREATE INDEX "apikey_referenceId_idx" ON "apikey" USING btree ("reference_id");
    CREATE INDEX "apikey_key_idx" ON "apikey" USING btree ("key");
    CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");
    CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");
  END IF;
END $$;
